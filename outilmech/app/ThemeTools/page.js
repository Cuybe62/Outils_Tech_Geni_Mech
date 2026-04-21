import Card from "../components/ThemTools/Card";
import Rotation_function from "@/public/img/Math/Rotation_function.png";
import Link from "next/link";

export default function ThemeTools({ element }) {
  return (
    <Link href={"/Math/Vectors"}>
      <Card
        image={Rotation_function}
        description={"ce texte est un teste"}
      ></Card>
    </Link>
  );
}
