// app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [query_client] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={query_client}>
            <NextUIProvider>
                <NextThemeProvider attribute="class" defaultTheme="dark">
                    {children}
                </NextThemeProvider>
            </NextUIProvider>
        </QueryClientProvider>
    );
}
