import Rotation_function from "@/public/img/Math/Rotation_function.png";
import Image from "next/image";
import "./style.css";

export default function Card() {
  return (
    <div className="card h-auto w-92 border-solid border-black bg-blue-500  hover:border-solid">
      <Image src={Rotation_function} alt="h"></Image>
      <button className="btn btn-primary ">Lancer</button>
    </div>
  );
}
