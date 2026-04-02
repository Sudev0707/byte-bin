
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, setSession } from "@/utils/localStorage";
import { authService, axiosInstance } from "@/api/axios.js";
import { User, Mail, Edit3, Save, Lock, Eye, EyeOff, Users, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileData {
  id?: string;
  username: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  dateJoined?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    email: "",
    imageUrl: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  
  // Get session inside useEffect to avoid stale closure
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      
      if (!session?.isLoggedIn) {
        navigate("/login");
        return;
      }
      
      const userData = await authService.getCurrentUser();
      setProfile({
        id: userData.id,
        username: userData.username || userData.name || "User",
        email: userData.email,
        imageUrl: userData.imageUrl || "",
        bio: userData.bio || "",
        dateJoined: userData.dateJoined || userData.createdAt,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load profile data.",
        variant: "destructive",
      });
      console.error("Profile fetch error:", error);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load profile data on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile.username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    setSaveLoading(true);
    try {
      const updateData = {
        username: profile.username.trim(),
        imageUrl: profile.imageUrl || "",
        bio: profile.bio || "",
      };
      
      const response = await axiosInstance.put("/auth/profile", updateData);
      
      // Update local session with new data
      const currentSession = getSession();
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          username: profile.username.trim(),
          imageUrl: profile.imageUrl || "",
          bio: profile.bio || "",
        };
        setSession(updatedSession);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save profile.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!oldPassword) {
      toast({
        title: "Error",
        description: "Current password is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPassword) {
      toast({
        title: "Error",
        description: "New password is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setPwdLoading(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword: oldPassword,
        newPassword,
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      
      // Reset form and close dialog
      setPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto p-4 md:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account details and preferences.</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saveLoading || !profile.username.trim()}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    // Reload original data
                    fetchProfile();
                  }} 
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.imageUrl} alt={profile.username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="space-y-2 min-w-[250px]">
                      <Label htmlFor="imageUrl">Avatar URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={profile.imageUrl || ""}
                        onChange={handleInputChange}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profile.username}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                    <Badge variant="default">Verified</Badge>
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="resize-vertical min-h-[100px]"
                    />
                  ) : (
                    <div className={cn(
                      "p-4 rounded-lg border bg-muted/50 min-h-[80px]",
                      !profile.bio && "text-muted-foreground italic"
                    )}>
                      {profile.bio ? (
                        <>
                          <FileText className="mr-2 h-4 w-4 inline" />
                          {profile.bio}
                        </>
                      ) : "No bio set. Add one to personalize your profile!"}
                    </div>
                  )}
                </div> */}

                <div className="flex gap-2 pt-4">
                  <Badge variant="default">Profile Active</Badge>
                  {profile.dateJoined && (
                    <Badge variant="outline">
                      Joined {new Date(profile.dateJoined).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPasswordDialogOpen(true)}
                  className="w-full justify-start"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Enable 2FA, manage sessions, and review recent activity.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Social integrations coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and new password.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10 border-gray-500 "
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 border-gray-500 "
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 border-gray-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPasswordDialogOpen(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordUpdate} 
              disabled={pwdLoading || !oldPassword || !newPassword || newPassword.length < 8}
            >
              {pwdLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;