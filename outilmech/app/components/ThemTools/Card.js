import Image from "next/image";
import "./style.css";

export default function Card({ image, description }) {
  return (
    <div className="card h-70 w-92 border-solid border-black hover:border-solid">
      <div className="relative size-full">
        <div className="absolute dsp size-full p-3 z-1 ">
          {" "}
          <p className="dsp_text max-w-lg text-3xl font-semibold leading-normal text-center z-2">
            {description}
          </p>
        </div>

        <div className="absolute img_card z-0">
          <Image src={image} alt="h"></Image>
        </div>
      </div>
      <button className="btn_card  ">Lancer</button>
    </div>
  );
}
