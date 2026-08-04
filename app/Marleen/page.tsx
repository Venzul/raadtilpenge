import Image from "next/image";

export default function MarleenPage() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#a8d4f0]">
      <Image
        src="/marleen/foredrag.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-contain object-center"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <div className="max-w-xl animate-[marleen-rise_1.1s_ease-out_both]">
          <p className="text-[1.08rem] font-extrabold leading-snug tracking-tight text-[#ff7eb6] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-[1.2rem]">
            Tillykke med de 43 år, min skat!
          </p>

          <div className="mt-3 space-y-2 text-[0.76rem] font-semibold leading-relaxed text-[#ff9ec8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[0.8rem]">
            <p>
              Du er en utroligt god og betænksom person – både som kæreste og
              som mor til vores lille familie.
            </p>
            <p>
              Du har et hjerte af guld, og du gør vores verden så meget varmere
              og dejligere at være i.
            </p>
          </div>

          <div className="mt-3 animate-[marleen-rise_1.3s_0.25s_ease-out_both] rounded-2xl bg-black/25 px-3 py-3 backdrop-blur-[2px] ring-1 ring-[#ff7eb6]/35">
            <p className="text-[0.7rem] font-bold text-[#ff7eb6]">
              Her får du her to billetter til:
            </p>
            <p className="mt-1.5 text-[0.8rem] font-extrabold leading-snug text-[#ffb0d4]">
              Foredrag: &ldquo;Følg dine drømme&rdquo; med Lene &amp; Anders
              Beier
            </p>
            <dl className="mt-2 space-y-0.5 text-[0.7rem] font-semibold text-[#ff9ec8]">
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 opacity-80">Sted</dt>
                <dd>Musikkens Hus</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 opacity-80">Dato</dt>
                <dd>21. april 2027</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marleen-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
