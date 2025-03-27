import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
// import { ThemeProvider } from "@/components/theme-provider";
// import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Chrono Squire",
  description: "Your time servent",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex min-h-screen flex-col">
        {/* <ThemeProvider> */}
        <TRPCReactProvider>
          {/* <div className="absolute right-4 top-4">
              <ThemeToggle />
            </div> */}
          {children}
          <Toaster />
        </TRPCReactProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
