using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Services;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers;

[ApiController]
public class AccountController : BaseApiController
{
    private readonly IConfiguration _config;
    private readonly IEmailSender _emailSender;
    private readonly HttpClient _httpClient;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly UserManager<AppUser> _userManager;

    public AccountController(UserManager<AppUser> userManager, TokenService tokenService, IConfiguration config,
        SignInManager<AppUser> signInManager, IEmailSender emailSender)
    {
        _tokenService = tokenService;
        _config = config;
        _signInManager = signInManager;
        _emailSender = emailSender;
        _userManager = userManager;
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://graph.facebook.com")
        };
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(
            x => x.Email == loginDto.Email);

        if (user == null) return Unauthorized("Invalid email");

        if (!user.EmailConfirmed) return Unauthorized("Email not confirmed");

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        if (!result.Succeeded)
            return Unauthorized();

        await SetRefreshToken(user);
        return CreateUserObject(user);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.UserName))
        {
            ModelState.AddModelError("userName", "Username is already taken");
            return BadRequest(ModelState);
        }

        if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            ModelState.AddModelError("email", "Email is already taken");
            return BadRequest(ModelState);
        }

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.UserName
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
            return BadRequest("Problem registering user");

        var origin = Request.Headers["origin"];
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
        var message =
            $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";

        await _emailSender.SendEmailAsync(user.Email, "Please verify your email address", message);

        return Ok("Registration successfully - Please verify your email address");
    }

    [AllowAnonymous]
    [HttpPost("verifyEmail")]
    public async Task<IActionResult> VerifyEmail(string token, string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Unauthorized();
        var decodedTokenByBytes = WebEncoders.Base64UrlDecode(token);
        var decodedToken = Encoding.UTF8.GetString(decodedTokenByBytes);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (!result.Succeeded) return BadRequest("Could not verify email address");

        return Ok("Email confirmed - you can login now");
    }

    [AllowAnonymous]
    [HttpGet("resendEmailConfirmationLink")]
    public async Task<IActionResult> ResendEmailConfirmationLink(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return Unauthorized();

        var origin = Request.Headers["origin"];
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
        var message =
            $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";

        await _emailSender.SendEmailAsync(user.Email, "Please verify your email address", message);

        return Ok("Email verification link resent");
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(
            x => x.Email == User.FindFirstValue(ClaimTypes.Email));

        await SetRefreshToken(user);
        return CreateUserObject(user);
    }

    [AllowAnonymous]
    [HttpPost("fbLogin")]
    public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
    {
        var fbVerifyKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:ApiSecret"];
        var verifyTokenResponse =
            await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");
        if (!verifyTokenResponse.IsSuccessStatusCode) return Unauthorized();

        var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";

        var fbInfo = await _httpClient.GetFromJsonAsync<FacebookDto>(fbUrl);

        var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(x => x.Email == fbInfo.Email);

        IdentityResult result;

        if (user != null)
        {
            var photo = user.Photos.First(x => x.IsMain);
            if (photo.Url != fbInfo.Picture.Data.Url)
            {
                user.Photos.First(x => x.IsMain).IsMain = false;
                user.Photos.Add(new Photo
                {
                    Id = "fb_" + fbInfo.Id + user.Photos.Count,
                    Url = fbInfo.Picture.Data.Url,
                    IsMain = true
                });
            }

            user.DisplayName = fbInfo.Name;
            result = await _userManager.UpdateAsync(user);
        }
        else
        {
            user = new AppUser
            {
                DisplayName = fbInfo.Name,
                Email = fbInfo.Email,
                UserName = "fb_" + fbInfo.Id,
                EmailConfirmed = true,
                Photos = new List<Photo>
                {
                    new()
                    {
                        Id = "fb_" + fbInfo.Id,
                        Url = fbInfo.Picture.Data.Url,
                        IsMain = true,
                    }
                }
            };

            result = await _userManager.CreateAsync(user);
        }

        if (!result.Succeeded) return BadRequest("Problem creating user account");

        await SetRefreshToken(user);

        return CreateUserObject(user);
    }

    [Authorize]
    [HttpPost("refreshToken")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        var user = await _userManager.Users.Include(r => r.RefreshTokens).Include(p => p.Photos)
            .FirstOrDefaultAsync(x => x.UserName == User.FindFirstValue(ClaimTypes.Name));

        if (user == null)
            return Unauthorized();

        var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);

        if (oldToken != null && !oldToken.IsActive) return Unauthorized();

        return CreateUserObject(user);
    }

    private UserDto CreateUserObject(AppUser user)
    {
        var userDto = new UserDto
        {
            DisplayName = user.DisplayName,
            Token = _tokenService.CreateToken(user),
            UserName = user.UserName
        };

        if (!user.Photos.IsNullOrEmpty())
            userDto.Image = user.Photos.FirstOrDefault(x => x.IsMain)?.Url;


        return userDto;
    }

    private async Task SetRefreshToken(AppUser user)
    {
        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokens.Add(refreshToken);

        await _userManager.UpdateAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = refreshToken.Expires
        };

        Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
    }
}