using Microsoft.EntityFrameworkCore;
using EchoLetters_backend.Models; // potrzebne do widzenia klasy User

namespace EchoLetters_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
    }
}
