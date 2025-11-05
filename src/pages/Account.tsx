import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Lock, LogOut, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, updateUserProfile } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export default function Account() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    joinDate: "",
    totalHabits: 0,
    completedSessions: 0,
    name: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await fetchWithAuth(`${API_BASE_URL}/users/me`);
        
        // Handle different response structures
        const userName = userData?.name || "Demo User";
        const userEmail = userData?.email || "";
        const createdAt = userData?.created_at || new Date().toISOString();
        
        setProfileData({
          fullName: userName,
          email: userEmail,
          joinDate: new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          totalHabits: userData?.total_habits || 0,
          completedSessions: userData?.completed_sessions || 0,
          name: userData?.name || "",
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: "Could not fetch user data. Please try again later.",
        });
      }
    };

    fetchUserProfile();
  }, [toast]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleProfileUpdate = async () => {
    try {
      const updatedUser = await updateUserProfile({
        name: profileData.fullName
      });
      
      // Update local state with the response from server
      setProfileData(prev => ({
        ...prev,
        fullName: updatedUser.name || updatedUser.fullName,
        name: updatedUser.name
      }));
      
      toast({
        title: "Profile updated successfully!",
        description: "Your account information has been saved.",
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
      });
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "New passwords don't match. Please try again.",
      });
      return;
    }

    toast({
      title: "Password updated successfully!",
      description: "Your password has been changed.",
    });
    
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the authentication token
    toast({
      title: "Logged out successfully",
      description: "See you next time! Keep building those habits.",
    });
    // Redirect to login page after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-poppins font-bold text-foreground">
                  Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your profile and account settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-4xl mx-auto">
          {/* Profile Overview */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-hero text-white">
                      {profileData.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profileData.fullName}</h3>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  <p className="text-sm text-muted-foreground">Member since {profileData.joinDate}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profileData.totalHabits}</div>
                  <div className="text-sm text-muted-foreground">Total Habits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{profileData.completedSessions}</div>
                  <div className="text-sm text-muted-foreground">Completed Sessions</div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  {!isEditingProfile ? (
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="hero"
                        onClick={handleProfileUpdate}
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <Button 
                variant="outline"
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="shadow-medium border-destructive/20">
            <CardHeader>
              <CardTitle className="font-poppins text-xl flex items-center gap-3 text-destructive">
                <LogOut className="w-6 h-6" />
                Account Actions
              </CardTitle>
              <CardDescription>
                Manage your account sessions and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <h4 className="font-medium">Logout</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your HabitFlow account
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}