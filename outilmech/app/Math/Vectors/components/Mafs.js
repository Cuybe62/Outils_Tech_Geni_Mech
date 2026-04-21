import { Mafs, Coordinates, Vector, Polygon } from "mafs";

export default function MafsVector({ viewBox, moveable, zommeable }) {
  return (
    <Mafs pan={moveable} viewBox={viewBox} preserveAspectRatio={false}>
      <Coordinates.Cartesian />
      <Polygon
        points={[
          [-5, -5],
          [5, -5],
          [5, 5],
          [-5, 5],
        ]}
      />
      <Vector tail={[0, 0]} tip={[3, 4]} />
    </Mafs>
  );
}
