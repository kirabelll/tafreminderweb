"use client";

import { useState } from "react";
import { Menu, X, Plus, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MobileHeaderProps {
  onMenuItemClick: (item: 'create' | 'list' | 'stats') => void;
  activeSection: string;
}

export default function MobileHeader({ onMenuItemClick, activeSection }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'create', label: 'Create Reminder', icon: Plus },
    { id: 'list', label: 'My Reminders', icon: List },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const handleMenuClick = (item: 'create' | 'list' | 'stats') => {
    onMenuItemClick(item);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">TAF Reminder</h1>
              <p className="text-xs text-muted-foreground">Stay organized</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <Card className="absolute top-full left-0 right-0 rounded-none border-x-0 border-b-0 shadow-lg">
            <nav className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleMenuClick(item.id as 'create' | 'list' | 'stats')}
                    className={`w-full justify-start space-x-3 px-4 py-3 h-auto ${
                      isActive ? 'bg-accent text-accent-foreground border-r-2 border-primary' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </Card>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}