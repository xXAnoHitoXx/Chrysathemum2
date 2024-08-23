import "~/styles/globals.css";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";

import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import { get_bisquit } from "~/server/queries/crud/biscuits";
import { Bisquit } from "~/server/validation/bisquit";
import { is_data_error } from "~/server/data_error";

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
            <html lang="en" className="dark">
                <body className={`font-sans ${inter.variable}`}>
                    <Providers>
                        <div className="flex flex-col w-full h-dvh">
                        <TopNav />
                        {children}
                        </div>
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}

function TopNav() {
    const salon = get_bisquit(Bisquit.salon_selection);
    return (
        <nav
            id="top-nav"
            className="flex w-full items-center justify-between border-b-4 border-sky-500 p-4 text-xl font-semibold"
        >
            <a href="/">
                <div>{
                    is_data_error(salon) ?
                        ("Chrysanthemum Spa") :
                        salon === "5CBL" ?
                            ("Cumberland") :
                            ("Sackville")
                }</div>
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
