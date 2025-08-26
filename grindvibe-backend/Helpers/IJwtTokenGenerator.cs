using grindvibe_backend.Models;

namespace grindvibe_backend.Helpers;

public interface IJwtTokenGenerator
{
    string Generate(User user);
}