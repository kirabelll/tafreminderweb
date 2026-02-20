"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MobileHeader from "../components/mobile-header";

// Dynamic imports to prevent SSR issues
const MobileReminderForm = dynamic(() => import("../components/mobile-reminder-form"), {
  ssr: false,
  loading: () => (
    <div className="p-4 max-w-lg mx-auto">
      <div className="animate-pulse bg-muted rounded-lg h-96"></div>
    </div>
  )
});

const MobileReminderList = dynamic(() => import("../components/mobile-reminder-list"), {
  ssr: false,
  loading: () => (
    <div className="p-4 max-w-lg mx-auto">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted rounded-lg h-32"></div>
        ))}
      </div>
    </div>
  )
});

const MobileStats = dynamic(() => import("../components/mobile-stats"), {
  ssr: false,
  loading: () => (
    <div className="p-4 max-w-lg mx-auto">
      <div className="animate-pulse bg-muted rounded-lg h-96"></div>
    </div>
  )
});

const TelegramProvider = dynamic(() => import("../components/telegram-mini-app").then(mod => ({ default: mod.TelegramProvider })), {
  ssr: false
});

export default function Home() {
  const [activeSection, setActiveSection] = useState<'create' | 'list' | 'stats'>('create');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMenuItemClick = (item: 'create' | 'list' | 'stats') => {
    setActiveSection(item);
  };

  const renderActiveSection = () => {
    if (!isClient) {
      return (
        <div className="p-4 max-w-lg mx-auto">
          <div className="animate-pulse bg-muted rounded-lg h-96"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'create':
        return <MobileReminderForm />;
      case 'list':
        return <MobileReminderList />;
      case 'stats':
        return <MobileStats />;
      default:
        return <MobileReminderForm />;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          onMenuItemClick={handleMenuItemClick}
          activeSection={activeSection}
        />
        <main className="pb-6">
          <div className="p-4 max-w-lg mx-auto">
            <div className="animate-pulse bg-muted rounded-lg h-96"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <TelegramProvider>
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          onMenuItemClick={handleMenuItemClick}
          activeSection={activeSection}
        />
        
        <main className="pb-6">
          {renderActiveSection()}
        </main>
      </div>
    </TelegramProvider>
  );
}
