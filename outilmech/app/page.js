import Card from "./components/index/card";
import { lstTheme } from "./entity/themes/data";
import { useId } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" flex flex-wrap gap-10">

      <Link
        href="/SinBars"
        className="w-full rounded-2xl border border-base-300 bg-base-100 p-6 shadow hover:bg-base-200"
      >
        <h2 className="text-xl font-semibold">Simulateur Barre Sinus</h2>
        <p className="mt-2 text-sm opacity-80">
          Ouvrir le simulateur de métrologie (barre sinus) intégré à l&apos;app.
        </p>
      </Link>
      {lstTheme.map((element) => (
        <Link key={element.id} href={"/ThemeTools"}>
          <Card
            key={element.id} // Always include a unique key
            name={element.name}
            description={element.description}
            img={element.img}
          />
        </Link>
      ))}
    </div>
  );
}
