import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { FloatingActionButton } from "@/components/navigation/quick-actions";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-bg to-gray-50">
      {/* Desktop Header - hidden on mobile */}
      <div className="hidden lg:block">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>
      
      <div className="lg:flex lg:pt-20">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Desktop Mobile Nav - for backward compatibility */}
        <MobileNav 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:mr-80 p-3 sm:p-4 md:p-6 pt-16 lg:pt-6 pb-20 lg:pb-6">
          <div className="max-w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
      
      {/* Floating Action Button for Mobile - only on larger screens */}
      <div className="hidden md:block">
        <FloatingActionButton />
      </div>
    </div>
  );
}
