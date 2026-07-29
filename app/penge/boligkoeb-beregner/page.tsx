import type { Metadata } from "next";
import MortgageCalculator from "./MortgageCalculator";

export const metadata: Metadata = {
  title: "Boligkøb beregner | RådTilPenge",
  description:
    "Se, hvad det koster at låne til ny bolig – ydelse, lånedetaljer og amortisationstabel.",
};

export default function BoligkoebBeregnerPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Nyt lån til boligkøb
        </h1>
        <p className="mt-2 max-w-2xl text-white">
          Se, hvad det koster at låne til ny bolig.
        </p>
      </div>

      <MortgageCalculator />
    </main>
  );
}
