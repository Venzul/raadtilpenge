import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:px-6">
          <p className="text-zinc-600">Indlæser…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
