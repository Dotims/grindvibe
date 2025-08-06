using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Models; // potrzebne do widzenia klasy User

namespace grindvibe_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
    }
}
