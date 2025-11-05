import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Moon, Globe, Clock, Download, UserCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

export default function Settings() {
  const { toast } = useToast();
  const { user, isLoading, error } = useUser();
  
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    dailyReminder: true,
    reminderTime: "09:00",
    timezone: "UTC-5",
    language: "en",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    });
  };

  const exportData = (format: "csv" | "json") => {
    toast({
      title: `Exporting data as ${format.toUpperCase()}`,
      description: "Your habit data will be downloaded shortly.",
    });
  };

  const timezones = [
    { value: "UTC-12", label: "(UTC-12:00) International Date Line West" },
    { value: "UTC-8", label: "(UTC-08:00) Pacific Time" },
    { value: "UTC-5", label: "(UTC-05:00) Eastern Time" },
    { value: "UTC+0", label: "(UTC+00:00) London" },
    { value: "UTC+1", label: "(UTC+01:00) Berlin" },
    { value: "UTC+8", label: "(UTC+08:00) Singapore" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  const reminderTimes = [
    "07:00", "08:00", "09:00", "10:00", "18:00", "19:00", "20:00", "21:00"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize your HabitFlow experience
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-4xl mx-auto">
          {/* Appearance */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Moon className="w-6 h-6 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how HabitFlow looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how and when you receive reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="font-medium">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive habit reminders and motivational messages
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="daily-reminder" className="font-medium">
                    Daily Reminder
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get a daily reminder to check in on your habits
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={settings.dailyReminder}
                  onCheckedChange={(checked) => handleSettingChange("dailyReminder", checked)}
                  disabled={!settings.notifications}
                />
              </div>

              {settings.dailyReminder && settings.notifications && (
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reminder Time
                  </Label>
                  <Select
                    value={settings.reminderTime}
                    onValueChange={(value) => handleSettingChange("reminderTime", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localization */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                Localization
              </CardTitle>
              <CardDescription>
                Set your location and language preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-medium">Time Zone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleSettingChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Download className="w-6 h-6 text-primary" />
                Data Export
              </CardTitle>
              <CardDescription>
                Download your habit tracking data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export your habit data to keep a backup or analyze your progress in external tools.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => exportData("csv")}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => exportData("json")}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* User Profile */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <UserCircle2 className="w-6 h-6 text-primary" />
                User Profile
              </CardTitle>
              <CardDescription>
                View and manage your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="user-name" className="font-medium">
                    Name
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : user?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="user-email" className="font-medium">
                    Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading..." : user?.email || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}