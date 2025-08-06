namespace grindvibe_backend.Models
{
    public class User
    {
        public int Id { get; set; } 
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
    }
} 