import HeroSection from '../components/landing/HeroSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import EventDetails from '../components/landing/EventDetails';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section - Full viewport height without outer padding */}
      <section className="relative overflow-hidden">
        <HeroSection />
      </section>

      {/* Features Grid - With controlled inner padding only */}
      <section className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <FeaturesGrid />
        </div>
      </section>

      {/* Event Details - Full width background */}
      <section className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <EventDetails />
        </div>
      </section>

      {/* Final CTA - Full width gradient background */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <FinalCTA />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}