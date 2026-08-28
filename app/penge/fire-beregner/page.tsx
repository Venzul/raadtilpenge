import type { Metadata } from "next";
import FireCalculator from "./FireCalculator";

export const metadata: Metadata = {
  title: "FIRE Beregner | Råd Til Penge",
  description:
    "Beregn dit FIRE-mål efter 4%-reglen, opsparingsrate og estimeret tid til økonomisk uafhængighed.",
};

export default function FireBeregnerPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          FIRE Beregner (Financial Independence, Retire Early)
        </h1>
        <p className="mt-2 max-w-2xl text-white">
          Find dit FIRE-mål med 4%-reglen, og se hvor lang tid det tager at nå
          økonomisk uafhængighed ud fra indkomst, udgifter og forventet afkast.
        </p>
      </div>

      <FireCalculator />
    </main>
  );
}
