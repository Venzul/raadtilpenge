"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkCredentials,
  isLoggedIn,
  setAuthCookie,
} from "../lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace(searchParams.get("next") || "/admin");
    }
  }, [router, searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!checkCredentials(username, password)) {
      setError("Forkert brugernavn eller adgangskode.");
      return;
    }

    setAuthCookie();
    router.replace(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Log ind
      </h1>
      <p className="mt-2 text-zinc-600">Log ind for at se analytics.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-zinc-700"
          >
            Brugernavn
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700"
          >
            Adgangskode
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Log ind
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </main>
  );
}
