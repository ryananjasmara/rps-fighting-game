import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { SocketProvider } from "@hooks/use-socket";
import { ErrorBoundary } from "@components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Multiplayer Rock-Paper-Scissors Fighting Game",
  description:
    "A real-time multiplayer fighting game with rock-paper-scissors mechanics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"}>
      <body className={inter.className}>
        <ErrorBoundary>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
