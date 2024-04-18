import "~/styles/globals.css";

import { ClerkProvider } from '@clerk/nextjs'

import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Chrysanthemum",
  description: "does a thing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{
        baseTheme: dark
        }}>
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>{children}</body>
    </html>
    </ClerkProvider>
  );
}
