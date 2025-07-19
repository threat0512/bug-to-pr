import Demo from "@/features/landing/Demo";
import Footer from "@/features/landing/Footer";
import Hero from "@/features/landing/Hero";
import ProcessFlow from "@/features/landing/ProcessFlow";


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
