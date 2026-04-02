import Carouselle from "./carousel";
import Image from "next/image";

export default function Card({ name, description, img }) {
  return (
    <div className="card bg-base-100 w-96 p-3 shadow-sm">
      <figure>
        <Image src={img} alt="source"></Image>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
