import { Hero } from "../components/home/Hero"
import { FeaturesSection } from "../components/home/FeaturesSection"
import { StatsSection } from "../components/home/StatsSection"

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <FeaturesSection />
      <StatsSection />
    </div>
  )
}
