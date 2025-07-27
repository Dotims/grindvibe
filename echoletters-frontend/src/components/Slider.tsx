import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "Absolutnie pokochałem ten audiobook. Narracja była na najwyższym poziomie.",
    img: "/featured-books/featured-psycho.png",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "Immersyjne doświadczenie. Czułem się, jakbym oglądał film uszami.",
    img: "/featured-books/featured-romantic.png",
  },
  {
    name: "John",
    username: "@john",
    body: "Aktorstwo głosowe ożywiło bohaterów. Genialne!",
    img: "/featured-books/featured-fantasy.png",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "Nie sądziłam, że audiobook może być tak emocjonalny.",
    img: "/featured-books/featured-scienceFiction.png",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "Fascynująca historia i świetne tempo. Gorąco polecam.",
    img: "/featured-books/featured-historical.png",
  },
  {
    name: "James",
    username: "@james",
    body: "Słuchałem już dwa razy. Nie mogę się doczekać kolejnych tytułów w tym stylu!",
    img: "/featured-books/featured-selfHelp.png",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative flex h-52 w-[420px] min-w-[320px] cursor-pointer overflow-hidden rounded-xl border",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      {/* Lewa strona - okładka audiobooka */}
      <div className="relative w-1/2 h-full">
        <Image
          src={img}
          alt="Okładka audiobooka"
          fill
          className="object-cover rounded-l-xl"
        />
      </div>

      {/* Prawa strona - treść */}
      <div className="w-1/2 h-full p-4 flex flex-col justify-items-start">
        {/* Avatar + imię */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/default_user.png"
              alt="Avatar użytkownika"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <figcaption className="text-sm font-semibold dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>

        {/* Treść recenzji */}
        <blockquote className="text-sm leading-snug text-muted-foreground dark:text-white/80 mt-2 line-clamp-4">
          {body}
        </blockquote>
      </div>
    </figure>
  );
};

export default function Slider() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden container ml-auto mr-auto py-12">
      <Marquee pauseOnHover className="[--duration:20s] mb-6">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>

      {/* Gradientowe wygaszenia */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
