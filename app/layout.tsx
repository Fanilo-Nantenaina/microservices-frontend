import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RH Dashboard — MERN K8s",
  description: "Système de gestion des ressources humaines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}