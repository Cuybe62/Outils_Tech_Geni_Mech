import Card from "./components/index/card";
import { lstTheme } from "./entity/themes/data";
import { useId } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" flex flex-wrap gap-10">
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
