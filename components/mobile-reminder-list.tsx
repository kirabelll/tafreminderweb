"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTelegramWebApp } from "./telegram-mini-app";

const API_BASE_URL = "https://tafreminderbot-backend-n14i.vercel.app";

// Local storage helpers
const getFromLocalStorage = (): ApiReminder[] => {
  try {
    const stored = localStorage.getItem('taf-reminders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const deleteFromLocalStorage = (id: string) => {
  try {
    const reminders = getFromLocalStorage();
    const filtered = reminders.filter(r => r.id !== id);
    localStorage.setItem('taf-reminders', JSON.stringify(filtered));
    return true;
  } catch (error) {
    return false;
  }
};

interface ApiReminder {
  id: string;
  title: string;
  description: string;
  expiredDate: string;
  userId: string;
  createdAt: string;
  isNotified: boolean;
  isActive: boolean;
}

export default function MobileReminderList() {
  const { webApp, user, isClient } = useTelegramWebApp();
  const [reminders, setReminders] = useState<ApiReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const fetchReminders = async () => {
    if (!isClient) return;
    
    setLoading(true);
    setError("");
    
    // Get user ID from Telegram or fallback
    const userId = user?.id?.toString() || "web-user";
    
    try {
      console.log('Attempting to fetch from API:', API_BASE_URL);
      console.log('User ID:', userId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_BASE_URL}/api/reminders/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setReminders(Array.isArray(data) ? data : []);
        setError("");
        
        // Success haptic feedback
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.impactOccurred('light');
        }
        return;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (err: any) {
      console.warn("API failed, using local storage:", err.message);
      
      // Fallback to local storage
      const localReminders = getFromLocalStorage();
      setReminders(localReminders);
      
      if (localReminders.length > 0) {
        setError("📱 Showing local reminders (API unavailable)");
      } else {
        setError("⚠️ API unavailable and no local data found");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      // Haptic feedback for delete action
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('medium');
      }

      // Try API first
      const response = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
        setError("");
        
        // Success haptic feedback
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success');
        }
        return;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (err: any) {
      console.warn("API delete failed, trying local storage:", err.message);
      
      // Error haptic feedback
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
      
      // Fallback to local storage
      const success = deleteFromLocalStorage(id);
      if (success) {
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
        setError("📱 Deleted from local storage (API unavailable)");
      } else {
        setError("❌ Failed to delete reminder");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getFilteredReminders = () => {
    switch (filter) {
      case 'active':
        return reminders.filter(r => !isExpired(r.expiredDate));
      case 'expired':
        return reminders.filter(r => isExpired(r.expiredDate));
      default:
        return reminders;
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchReminders();
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse bg-muted rounded h-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const filteredReminders = getFilteredReminders();
  const activeCount = reminders.filter(r => !isExpired(r.expiredDate)).length;
  const expiredCount = reminders.filter(r => isExpired(r.expiredDate)).length;

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header with Stats */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">My Reminders</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchReminders}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reminders.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
              <div className="text-xs text-muted-foreground">Expired</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <CardContent className="p-3">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: reminders.length },
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'expired', label: 'Expired', count: expiredCount },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? "default" : "ghost"}
                onClick={() => setFilter(tab.key as 'all' | 'active' | 'expired')}
                className="flex-1 text-sm"
                size="sm"
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert className="mb-6" variant={error.includes('❌') ? 'destructive' : 'default'}>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reminders...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReminders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reminders found</h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all' 
                ? "Create your first reminder to get started"
                : `No ${filter} reminders at the moment`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.map((reminder) => {
          const expired = isExpired(reminder.expiredDate);
          
          return (
            <Card key={reminder.id} className={expired ? 'border-destructive/50' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate mb-1">
                      {reminder.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {reminder.description}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReminder(reminder.id)}
                    className="ml-3 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={expired ? 'destructive' : 'secondary'}>
                    {expired ? (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expired
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </>
                    )}
                  </Badge>
                  
                  <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(reminder.expiredDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}