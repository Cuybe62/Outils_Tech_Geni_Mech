"use client";
import Section from "@/app/components/Tool/Section";
import MagfsComp from "./mafsComp";
export default function Graph() {
  return (
    <Section isOpen={true}>
      <div id="mafs" className="w-auto h-auto">
        <MagfsComp></MagfsComp>
      </div>
    </Section>
  );
}
