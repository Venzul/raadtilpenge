import type { Metadata } from "next";
import SkatsPositivliste from "./SkatsPositivliste";

export const metadata: Metadata = {
  title: "Skats positivliste | RådTilPenge",
  description:
    "Forstå Skats positivliste (ABIS), søg på ISIN eller fondsnavn, og se om vores anbefalede ETF'er er på listen.",
};

export default function SkatsPositivlistePage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Skats positivliste
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-8 text-white/80">
          Hvad listen betyder for din skat — og om en fond beskattes som
          aktieindkomst.
        </p>
      </div>

      <SkatsPositivliste />
    </main>
  );
}
