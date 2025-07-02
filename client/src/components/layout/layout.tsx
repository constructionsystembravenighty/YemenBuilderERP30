import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-bg to-gray-50">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="lg:flex pt-20">
        <Sidebar />
        <MobileNav 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 lg:mr-80 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
