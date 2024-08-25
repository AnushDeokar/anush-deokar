import DesktopView from "../components/desktop-main"
import MobileView from "../components/mobile-main"

export default function Home() {
  return (
    <main className="h-screen overflow-visible lg:p-8">
      <DesktopView />
      <MobileView />
    </main>
  )
}
