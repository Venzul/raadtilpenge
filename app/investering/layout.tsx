import InvesteringSubNav from "./InvesteringSubNav";

export default function InvesteringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mb-0 flex flex-1 flex-col bg-zinc-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 sm:px-6">
        <InvesteringSubNav />
        {children}
      </div>
    </div>
  );
}
