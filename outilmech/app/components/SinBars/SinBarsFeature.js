import SinBarsHeader from "./SinBarsHeader";
import SinBarsFrame from "./SinBarsFrame";
import SinBarsQuickActions from "./SinBarsQuickActions";

export default function SinBarsFeature() {
  return (
    <section className="w-full space-y-4">
      <SinBarsHeader />
      <SinBarsQuickActions />
      <SinBarsFrame />
    </section>
  );
}
