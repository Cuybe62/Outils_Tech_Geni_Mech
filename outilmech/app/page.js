import Image from "next/image";
import Card from "./components/index/card";
import { lstTheme } from "./entity/themes/data";
export default function Home() {
  console.print(lstTheme);
  return (
    <div className="p-6">
      {lstTheme.forEach((element) => {
        <Card
          name={element.name}
          description={element.description}
          img={element.img}
        ></Card>;
      })}
    </div>
  );
}
