"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, Type, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTelegramWebApp } from "./telegram-mini-app";

const API_BASE_URL = "https://tafreminderbot-backend-n14i.vercel.app";

// Fallback for development - simple local storage
const saveToLocalStorage = (reminder: any) => {
  if (typeof window === 'undefined') {
    throw new Error('Local storage not available on server');
  }
  
  try {
    const existingReminders = JSON.parse(localStorage.getItem('taf-reminders') || '[]');
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isNotified: false,
      isActive: true
    };
    existingReminders.push(newReminder);
    localStorage.setItem('taf-reminders', JSON.stringify(existingReminders));
    return newReminder;
  } catch (error) {
    throw new Error('Failed to save locally');
  }
};

interface ReminderData {
  title: string;
  description: string;
  expiredDate: string;
}

export default function MobileReminderForm() {
  const { webApp, user, isClient } = useTelegramWebApp();
  const [formData, setFormData] = useState<ReminderData>({
    title: "",
    description: "",
    expiredDate: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [minDate, setMinDate] = useState("");

  // Set minimum date on client side only
  useEffect(() => {
    if (isClient) {
      setMinDate(new Date().toISOString().split('T')[0]);
    }
  }, [isClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Haptic feedback for Telegram
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return;
    
    setIsSubmitting(true);
    setSubmitMessage("");

    // Get user ID from Telegram or fallback
    const userId = user?.id?.toString() || "web-user";

    const requestData = {
      title: formData.title,
      description: formData.description,
      expiredDate: formData.expiredDate,
      userId: userId
    };

    try {
      // Haptic feedback for submission
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('medium');
      }

      console.log('Attempting to connect to API:', API_BASE_URL);
      console.log('User data:', user);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_BASE_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setSubmitMessage("✅ Reminder created successfully!");
        setFormData({
          title: "",
          description: "",
          expiredDate: "",
        });
        
        // Success haptic feedback
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success');
        }
        return;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error: any) {
      console.warn("API failed, using local storage:", error.message);
      
      // Error haptic feedback
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
      
      // Fallback to local storage
      try {
        const savedReminder = saveToLocalStorage(requestData);
        setSubmitMessage("✅ Reminder saved locally! (API unavailable)");
        setFormData({
          title: "",
          description: "",
          expiredDate: "",
        });
        console.log('Saved to local storage:', savedReminder);
      } catch (localError: any) {
        setSubmitMessage(`❌ Error: ${localError.message || 'Failed to save reminder'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-xl">
          <CardTitle className="text-xl">Create New Reminder</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {user ? `Hello ${user.first_name}! ` : ''}Never forget important tasks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span>Title</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What do you need to remember?"
                required
                className="h-12"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Description</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Add more details about your reminder..."
                required
                className="resize-none"
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="expiredDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Due Date</span>
              </Label>
              <Input
                type="date"
                id="expiredDate"
                name="expiredDate"
                value={formData.expiredDate}
                onChange={handleInputChange}
                min={minDate}
                required
                className="h-12"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Create Reminder
                </>
              )}
            </Button>

            {/* Success/Error Message */}
            {submitMessage && (
              <Alert variant={submitMessage.includes('✅') ? 'default' : 'destructive'}>
                <AlertDescription>
                  {submitMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Debug Info for Development */}
            {process.env.NODE_ENV === 'development' && user && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-xs">
                <strong>Telegram User:</strong> {user.first_name} (ID: {user.id})
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}