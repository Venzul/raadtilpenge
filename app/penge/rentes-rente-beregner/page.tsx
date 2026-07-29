import type { Metadata } from "next";
import CompoundInterestCalculator from "./CompoundInterestCalculator";

export const metadata: Metadata = {
  title: "Rentes rente beregner | RådTilPenge",
  description:
    "Beregn hvordan opsparing vokser med rentes rente – inklusive månedlige indbetalinger og årligt afkast.",
};

export default function RentesRenteBeregnerPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Rentes rente beregner
        </h1>
        <p className="mt-2 max-w-2xl text-white">
          Se hvordan dit startbeløb og månedlige indbetalinger vokser over tid
          med rentes rente.
        </p>
      </div>

      <CompoundInterestCalculator />
    </main>
  );
}
