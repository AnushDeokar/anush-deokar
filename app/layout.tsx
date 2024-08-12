import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ToggleTheme } from "@/components/ui/toggle-theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anush Deokar",
  description: "Portfolio website created by Nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {children}
        <div className="fixed left-4 bottom-4">
          <ToggleTheme />
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
