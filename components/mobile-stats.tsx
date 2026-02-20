"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTelegramWebApp } from "./telegram-mini-app";

const API_BASE_URL = "https://tafreminderbot-backend-n14i.vercel.app";

// Local storage helper
const getLocalStats = () => {
  if (typeof window === 'undefined') {
    return {
      totalReminders: 0,
      expiredReminders: 0,
      activeReminders: 0
    };
  }
  
  try {
    const reminders = JSON.parse(localStorage.getItem('taf-reminders') || '[]');
    const now = new Date();
    const activeCount = reminders.filter((r: any) => new Date(r.expiredDate) >= now).length;
    const expiredCount = reminders.filter((r: any) => new Date(r.expiredDate) < now).length;
    
    return {
      totalReminders: reminders.length,
      expiredReminders: expiredCount,
      activeReminders: activeCount
    };
  } catch (error) {
    return {
      totalReminders: 0,
      expiredReminders: 0,
      activeReminders: 0
    };
  }
};

interface Stats {
  totalReminders: number;
  expiredReminders: number;
  activeReminders: number;
}

export default function MobileStats() {
  const { webApp, user, isClient } = useTelegramWebApp();
  const [stats, setStats] = useState<Stats>({
    totalReminders: 0,
    expiredReminders: 0,
    activeReminders: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!isClient) return;
    
    setLoading(true);
    
    // Get user ID from Telegram or fallback
    const userId = user?.id?.toString() || "web-user";
    
    try {
      console.log('Attempting to fetch stats from API:', API_BASE_URL);
      console.log('User ID:', userId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_BASE_URL}/api/reminders/${userId}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const userReminders = Array.isArray(data) ? data : [];
        
        const now = new Date();
        const activeCount = userReminders.filter(reminder => 
          new Date(reminder.expiredDate) >= now
        ).length;
        
        const expiredCount = userReminders.filter(reminder => 
          new Date(reminder.expiredDate) < now
        ).length;

        setStats({
          totalReminders: userReminders.length,
          expiredReminders: expiredCount,
          activeReminders: activeCount
        });
        
        // Success haptic feedback
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
        return;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error: any) {
      console.warn("API failed, using local storage:", error.message);
      
      // Fallback to local storage
      const localStats = getLocalStats();
      setStats(localStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchStats();
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalReminders > 0 
    ? Math.round((stats.expiredReminders / stats.totalReminders) * 100) 
    : 0;

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Statistics</CardTitle>
                <CardDescription>Your reminder insights</CardDescription>
              </div>
            </div>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => {
                if (webApp?.HapticFeedback) {
                  webApp.HapticFeedback.impactOccurred('medium');
                }
                fetchStats();
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Stats Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Total Reminders</h3>
              <p className="text-primary-foreground/80 text-sm">All time created</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-foreground/60" />
          </div>
          
          <div className="text-4xl font-bold mb-2">{stats.totalReminders}</div>
          
          {stats.totalReminders > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>{stats.activeReminders} Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                <span>{stats.expiredReminders} Expired</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Active Reminders */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">Active</h4>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.activeReminders}</div>
          </CardContent>
        </Card>

        {/* Expired Reminders */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">Expired</h4>
                <p className="text-xs text-muted-foreground">Past due</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">{stats.expiredReminders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      {stats.totalReminders > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Completion Rate</h4>
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {stats.expiredReminders} out of {stats.totalReminders} reminders have expired
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalReminders === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No data yet</h3>
            <p className="text-muted-foreground text-sm">
              Create some reminders to see your statistics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}