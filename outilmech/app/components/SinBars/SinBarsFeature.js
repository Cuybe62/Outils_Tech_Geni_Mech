import SinBarsHeader from "./SinBarsHeader";
import SinBarsFrame from "./SinBarsFrame";
import SinBarsQuickActions from "./SinBarsQuickActions";

export default function SinBarsFeature() {
  return (
    <section className="w-full space-y-3 overflow-hidden">
      <SinBarsHeader />
      <SinBarsQuickActions />
      <SinBarsFrame />
    </section>
  );
}
