import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "SeansBul",
  description: "İstanbul sinema seansları",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#0d0d0f] text-white min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}