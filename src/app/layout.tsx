import "~/styles/globals.css";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; 
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from "./providers"

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
        <body className={`font-sans ${inter.variable}`.concat("w-full h-lvh")}>
            <Providers>
            <TopNav/>
            {children}
            </Providers>
        </body>
    </html>
    </ClerkProvider>
  );
}

function TopNav() {
    return (
        <nav id="top-nav" className="flex w-full items-center justify-between border-b-4 border-sky-500 p-4 text-xl font-semibold">

            <div>Chrysanthemum Spa</div>

            <div>
                <SignedOut>
                    <SignInButton/> 
                </SignedOut>
                <SignedIn>
                    <UserButton/> 
                </SignedIn>
            </div>

        </nav>
    );
}
