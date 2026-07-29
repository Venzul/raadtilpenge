import type { Metadata } from "next";
import AktieKontotyper from "./AktieKontotyper";

export const metadata: Metadata = {
  title: "Aktie kontotyper | RådTilPenge",
  description:
    "Find den rigtige aktie-kontotype trin for trin – til børn, frie midler, pension og erhverv.",
};

export default function AktieKontotyperPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Aktie kontotyper
        </h1>
        <p className="mt-2 max-w-2xl text-white">
          Vælg én mulighed ad gangen. Kun den valgte sti vises, så du hurtigt
          finder den rigtige kontotype.
        </p>
      </div>

      <AktieKontotyper />
    </main>
  );
}
