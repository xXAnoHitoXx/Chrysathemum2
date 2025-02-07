import "~/styles/globals.css";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";

import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import { is_data_error } from "~/server/data_error";
import { Bisquit, get_bisquit } from "~/server/bisquit/bisquit";

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
        <ClerkProvider
            appearance={{
                baseTheme: dark,
            }}
        >
            <html lang="en">
                <body className={`font-sans ${inter.variable}`}>
                    <Providers>
                        <div className="flex h-lvh w-full flex-col">
                            <TopNav />
                            {children}
                        </div>
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}

async function TopNav() {
    const salon = await get_bisquit(Bisquit.enum.salon_selection);
    return (
        <nav
            id="top-nav"
            className="flex w-full items-center justify-between border-b-4 border-sky-900 bg-sky-100 p-4 text-xl font-semibold"
        >
            <a href="/">
                <div>
                    {is_data_error(salon)
                        ? "Chrysanthemum Spa"
                        : salon === "5CBL"
                          ? "Cumberland"
                          : "Sackville"}
                </div>
            </a>
            <div>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </nav>
    );
}
