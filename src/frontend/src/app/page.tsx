import Demo from "@/components/landing-page/Demo";
import Footer from "@/components/landing-page/Footer";
import Hero from "@/components/landing-page/Hero";
import ProcessFlow from "@/components/landing-page/Process-Flow";


export default function Page() {
  return (
    <div>
      <Hero />
      <ProcessFlow />
      <Demo />
      <Footer />
    </div>
  );
}
