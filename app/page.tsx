import DesktopView from "./desktop-view"
import MobileView from "./mobile-view"

export default function Home() {
  return (
    <main className="h-screen overflow-visible p-8">
      <DesktopView />
      <MobileView />
    </main>
  )
}
