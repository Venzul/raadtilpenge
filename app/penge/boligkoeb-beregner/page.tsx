import type { Metadata } from "next";
import MortgageCalculator from "./MortgageCalculator";

export const metadata: Metadata = {
  title: "Boligkøb beregner | Råd Til Penge",
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
        <p className="mt-2 max-w-3xl leading-7 text-white">
          Se hvor meget du kan købe nyt hus og lav beregning eller lav beregning
          på Boliglån.
          <br />
          <br />
          Du kan låne op til 80% af din ejerboligs værdi som realkreditlån (75%
          ved fritidshus). Resten skal finansieres med egen opsparing (min. 5%
          af boligens pris + omkostninger til boligkøbet) og evt. lån i dit
          pengeinstitut.
        </p>
      </div>

      <MortgageCalculator />
    </main>
  );
}
