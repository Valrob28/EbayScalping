import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ebay Scalping Dashboard",
  description: "Dashboard d'analyse et d'arbitrage de cartes TCG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
