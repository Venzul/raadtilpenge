import type { Metadata } from "next";
import CarCalculator from "./CarCalculator";

export const metadata: Metadata = {
  title: "Bil beregner | Råd Til Penge",
  description:
    "Find ud af, hvad du realistisk kan købe bil for ud fra nettoindkomst, TCO og lån – baglæns fra budget til max bilpris.",
};

export default function BilBeregnerPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Bil beregner
        </h1>
        <p className="mt-2 max-w-3xl leading-7 text-white">
          Start med din husstands nettoindkomst og arbejd baglæns til den
          maksimale bilpris, du realistisk har råd til. Beregneren trækker
          brændstof, forsikring, vedligehold og grøn ejerafgift fra dit
          bilbudget, før den regner lånebeløb og købspris ud – og viser den
          skjulte afskrivning over 5 år.
        </p>
      </div>

      <CarCalculator />
    </main>
  );
}
