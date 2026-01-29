import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FallingPetals from "@/components/animations/FallingPetals";

interface LayoutProps {
  children: ReactNode;
  showPetals?: boolean;
}

const Layout = ({ children, showPetals = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <FallingPetals enabled={showPetals} />
      <Header />
      <main className="flex-1 pt-16 md:pt-20 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
