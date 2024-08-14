import Image from "next/image"

import DesktopView from "./desktop-view"

export default function Home() {
  return (
    <main className="h-screen p-8">
      <DesktopView />
    </main>
  )
}
