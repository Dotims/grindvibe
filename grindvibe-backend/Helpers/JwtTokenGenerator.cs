using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using grindvibe_backend.Config;
using grindvibe_backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace grindvibe_backend.Helpers;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _opt;
    private readonly SigningCredentials _creds;

    public JwtTokenGenerator(IOptions<JwtOptions> opt)
    {
        _opt = opt.Value;

        if (string.IsNullOrWhiteSpace(_opt.Key))
            throw new InvalidOperationException("JwtOptions.Key nie może być pusty.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        _creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string Generate(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", $"{user.nickname}".Trim())
        };

        var token = new JwtSecurityToken(
            issuer: _opt.Issuer,
            audience: _opt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: _creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
