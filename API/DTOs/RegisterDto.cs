using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required] [EmailAddress] public string Email { get; set; }

    [Required]
    [RegularExpression("(?-i)(?=^.{6,}$)((?!.*\\s)(?=.*[A-Z])(?=.*[a-z]))(?=(1)(?=.*\\d)|.*[^A-Za-z0-9])^.*$",
        ErrorMessage = "Password must be complex")]
    public string Password { get; set; }

    [Required] public string DisplayName { get; set; }

    [Required] public string UserName { get; set; }
}