import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });


export const metadata: Metadata = {
  title: "RH Cloud — Gestion des ressources humaines",
  description: "Plateforme RH sur GKE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("font-mono", jetbrainsMono.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}