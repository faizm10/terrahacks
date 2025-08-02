import Navigation from "@/components/sections/navigation";
import Hero from "@/components/sections/hero";
import Testimonials from "@/components/sections/testimonials";
import Footer from "@/components/sections/footer";
export default function Home() {
  return (
    <div className="bg-primary-background overflow-x-hidden">
      <Navigation />
      <Hero />
      {/* <Testimonials /> */}
      {/* <Footer /> */}
    </div>
  );
}
