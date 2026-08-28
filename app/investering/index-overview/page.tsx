import type { Metadata } from "next";
import IndexOverview from "./IndexOverview";

export const metadata: Metadata = {
  title: "Indeks oversigt | Råd Til Penge",
  description:
    "Forstå aktiemarkedets indekser på dansk — ACWI IMI, MSCI World, S&P 500, Nasdaq, geografisk fordeling og hvad dine fonde egentlig dækker.",
};

export default function IndexOverviewPage() {
  return (
    <main className="flex-1 py-8 pb-16">
      <div className="mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Indeks oversigt
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-8 text-white/80">
          Forstå hvad “hele aktiemarkedet” egentlig er — og hvordan S&P 500 og
          Nasdaq adskiller sig fra globale indekser.
        </p>
      </div>

      <IndexOverview />
    </main>
  );
}
