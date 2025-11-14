import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LogoCarousel from "@/components/LogoCarousel";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <LogoCarousel />
      <Features />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
