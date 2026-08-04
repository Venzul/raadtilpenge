import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-marleen",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Til dig 💛",
  description: "En lille hemmelighed",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarleenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${nunito.className} fixed inset-0 z-50 overflow-hidden bg-sky-200`}
    >
      {children}
    </div>
  );
}
