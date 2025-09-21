namespace grindvibe_backend.Services.Filtering
{
    public static class Normalizer
    {
        public static string Norm(string? s) =>
            string.IsNullOrWhiteSpace(s)
                ? string.Empty
                : string.Join(" ", s.Trim().ToLowerInvariant()
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries));

        public static string Canon(string s) =>
            string.IsNullOrEmpty(s) ? s : (s.EndsWith('s') ? s[..^1] : s);

        public static string NormCanon(string? s) => Canon(Norm(s));
    }
}
