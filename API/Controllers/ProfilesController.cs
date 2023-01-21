using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProfilesController : BaseApiController
{
    [HttpGet("{username}")]
    public async Task<IActionResult> GetProfile(string username)
    {
        return HandleResult(await Mediator.Send(new Details.Query { UserName = username }));
    }

    [HttpPut("")]
    public async Task<IActionResult> EditProfile(ProfileEditDto profileEditDto)
    {
        return HandleResult(await Mediator.Send(new Edit.Command{Profile = profileEditDto}));
    }
}