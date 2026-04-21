import { Mafs } from "mafs";
import MafsVector from "./Mafs";

export default function MagfsComp({ children }) {
  const viewBox = {
    x: [-5, 5],
    y: [-5, 5],
    paddin: 0,
  };

  return (
    <div>
      <div className="carousel w-full">
        <div id="item1" className="carousel-item w-full">
          <MafsVector zoom={false} viewBox={viewBox}></MafsVector>
        </div>
      </div>
      <div className="flex w-full justify-center gap-2 py-2">
        <a href="#item1" className="btn btn-xs bg-base-200">
          1
        </a>
      </div>
    </div>
  );
}
