import Link from "next/link";
import { SITE_NAME } from "./lib/brand";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        {SITE_NAME}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
        Velkommen. Her får du råd om investering og privatøkonomi – på dansk.
        Vælg et emne for at komme i gang.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/investering"
          className="rounded-md bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Investering
        </Link>
        <Link
          href="/penge"
          className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          Penge
        </Link>
      </div>
    </main>
  );
}
