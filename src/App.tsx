import { Toaster } from "@/components/ui/sonner";
import { UrgencyBar } from "@/components/urgency-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import { Hero } from "@/components/sections/hero";
import { Resume } from "@/components/sections/resume";
import { Lire } from "@/components/sections/lire";
import { Auteure } from "@/components/sections/auteure";
import { Decouverte } from "@/components/sections/decouverte";
import { Acheter } from "@/components/sections/acheter";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { useTrackVisit } from "@/hooks/use-track-visit";
import { SettingsProvider } from "@/lib/settings-context";

export function App() {
  useTrackVisit("/");
  return (
    <SettingsProvider>
      <div className="min-h-svh">
        <UrgencyBar />
        <SiteHeader />
        <main>
          <Hero />
          <Resume />
          <Lire />
          <Auteure />
          <Decouverte />
          <Acheter />
          <Testimonials />
          <Faq />
          <Contact />
        </main>
        <SiteFooter />
        <BackToTop />
        <Toaster position="top-center" richColors />
      </div>
    </SettingsProvider>
  );
}

export default App;
