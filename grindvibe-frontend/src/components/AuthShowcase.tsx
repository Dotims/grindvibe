/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "test1",
    username: "@test1",
    body: "Nigdy wcześniej nie widziałem czegoś takiego. To niesamowite. Uwielbiam to.",
    img: "https://avatar.vercel.sh/jack",
  },
    {
    name: "Jack",
    username: "@test2",
    body: "Nigdy wcześniej nie widziałem czegoś takiego. To niesamowite. Uwielbiam to.",
    img: "https://avatar.vercel.sh/jack",
  },
    {
    name: "Jack",
    username: "@jack3",
    body: "Nigdy wcześniej nie widziałem czegoś takiego. To niesamowite. Uwielbiam to.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "Nie wiem, co powiedzieć. Brak mi słów. To niesamowite.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "Brakuje mi słów. To niesamowite. Uwielbiam to.",
    img: "https://avatar.vercel.sh/john",
  },
];


const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const thirdRow = reviews.slice(0, reviews.length / 2);
const fourthRow = reviews.slice(reviews.length / 2);

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
        "relative h-full w-fit sm:w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function AuthShowcase() {
  return (
    <div className="relative w-full h-full items-center justify-center overflow-hidden [perspective:300px] hidden lg:flex">
      {/* Marquee rows przesunięte do góry */}
      <div
        className="absolute top-[-315px] flex flex-row items-center gap-4"
        style={{
          height: "100%",
          transform:
            "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="h-[170vh] [--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="h-[130vh] [--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="h-[130vh] [--duration:20s]">
          {thirdRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover vertical className="h-[130vh] [--duration:20s]">
          {fourthRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>

      {/* Gradient fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#0C0A09]/90 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0C0A09]/90 to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#0C0A09]/90 to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#0C0A09]/90 to-transparent" />

    </div>
  );
}
