using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims; 
using System.Text;
using EchoLetters_backend.Models;
using Microsoft.IdentityModel.Tokens;

public class JwtTokenGenerator
{
    public static string GenerateToken(User user, IConfiguration config)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FirstName, user.Lastname),
            new Claim("avatar", user.AvatarUrl)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}