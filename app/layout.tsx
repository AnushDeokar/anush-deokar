import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

import { ToggleTheme } from "@/components/ui/toggle-theme"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Anush Deokar",
  description: "Portfolio website created in Nextjs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
          <div className="fixed bottom-4 left-4">
            <ToggleTheme />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
