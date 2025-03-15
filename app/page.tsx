import Image from "next/image";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-12 md:py-20">
      <div className="inline-block max-w-xl text-center">
        <Image
          src="/BIC Club Introduction (1).svg"
          alt="Family Feud Logo"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />
        <span className={title()}>Welcome to&nbsp;</span>
        <span className={title({ color: "yellow" })}>Family Feud&nbsp;</span>
        <br />
        <span className={title()}>Tech Edition by BIC Club</span>
        <div className={subtitle({ class: "mt-4" })}>
          Test your tech knowledge and compete with friends!
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          className={buttonStyles({
            color: "warning",
            variant: "shadow",
          })}
          href="/create"
        >
          Create Game Room
        </Link>
        <Link
          className={buttonStyles({ variant: "bordered", })}
          href="/join"
        >
          Join Game Room
        </Link>
      </div>

    </section>
  );
}
