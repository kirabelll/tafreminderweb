"use client";

import { useState } from "react";
import MobileHeader from "../components/mobile-header";
import MobileReminderForm from "../components/mobile-reminder-form";
import MobileReminderList from "../components/mobile-reminder-list";
import MobileStats from "../components/mobile-stats";
import { TelegramProvider } from "../components/telegram-mini-app";
import NoSSR from "../components/no-ssr";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'create' | 'list' | 'stats'>('create');

  const handleMenuItemClick = (item: 'create' | 'list' | 'stats') => {
    setActiveSection(item);
  };

  const renderActiveSection = () => {
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

  return (
    <NoSSR fallback={
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
    }>
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
    </NoSSR>
  );
}
