import DesktopView from "../components/desktop-main"
import MobileView from "../components/mobile-main"

export default function Home() {
  return (
    <main className="h-screen overflow-visible p-8">
      <DesktopView />
      <MobileView />
    </main>
  )
}
