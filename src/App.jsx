import { AIChat } from "@/components/AIChat/AIChat.jsx";
import { Footer } from "@/components/Landing/Footer.jsx";
import { Header } from "@/components/Landing/Header.jsx";
import { Hero } from "@/components/Landing/Hero.jsx";
import { Pains } from "@/components/Landing/Pains.jsx";
import { Services } from "@/components/Landing/Services.jsx";
import { Trust } from "@/components/Landing/Trust.jsx";
import { QuizModal } from "@/components/Quiz/QuizModal.jsx";
import { AppProvider } from "@/context/AppContext.jsx";

export default function App() {
  return (
    <AppProvider>
      <Header />
      <main>
        <Hero />
        <Pains />
        <Trust />
        <Services />
      </main>
      <Footer />
      <QuizModal />
      <AIChat />
    </AppProvider>
  );
}
