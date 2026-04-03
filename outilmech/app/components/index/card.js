import Carouselle from "./carousel";
import Image from "next/image";

export default function Card({ name, description, img }) {
  return (
    <div
      className=" card bg-base-100 w-96 p-3  hover:shadow-2xl 
    hover:scale-105 hover:border-2 hover:border-solid transition-all duration-300"
    >
      <figure>
        <Image src={img} alt="source"></Image>
      </figure>
      <div className="card-body bg-base-300 rounded">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
