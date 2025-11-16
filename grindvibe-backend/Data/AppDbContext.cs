using Microsoft.EntityFrameworkCore;
using grindvibe_backend.Models;

namespace grindvibe_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();

        public DbSet<Routine> Routines => Set<Routine>();
        public DbSet<RoutineDay> RoutineDays => Set<RoutineDay>();
        public DbSet<RoutineExercise> RoutineExercises => Set<RoutineExercise>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
