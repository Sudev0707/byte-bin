import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { getSession, setSession } from '@/utils/localStorage';
import { User, Mail, Edit3, Save, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import { Lock, Link2 as LinkIcon, Users, LogIn } from 'lucide-react';

interface ProfileData {
  username: string;
  email?: string;
  imageUrl?: string;
  bio?: string;
}

const Profile = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({ username: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [connectProvider, setConnectProvider] = useState('');

  // Load profile data on mount
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const session = getSession();
      const userProfile: ProfileData = {
        username: user.username || user.fullName || user.firstName || session?.username || 'User',
        email: user.primaryEmailAddress?.emailAddress || session?.email || '',
        imageUrl: user.imageUrl || session?.imageUrl || '',
        bio: session?.bio || '',
      };
      setProfile(userProfile);
    } else if (!isSignedIn) {
      navigate('/login');
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Extend session with profile data
      const updatedSession = {
        ...getSession(),
        ...profile,
      };
      setSession(updatedSession);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await user?.updatePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });
      toast({
        title: 'Success',
        description: 'Password updated successfully.',
      });
      setPasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.errors?.[0]?.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { signIn } = useSignIn();

  const handleConnectProvider = async (provider: string) => {
    try {
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.errors?.[0]?.message || 'Failed to connect provider.',
        variant: 'destructive',
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
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
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg ">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.imageUrl} />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="imageUrl">Avatar URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={profile.imageUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label>Display Name</Label>
                {isEditing ? (
                  <Input
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="text-lg"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5" />
                    {profile.username}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profile.email || 'Not set'}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <div className={cn(
                    'p-4 rounded-lg border bg-muted/50 min-h-[80px] flex items-center',
                    !profile.bio && 'text-muted-foreground italic'
                  )}>
                    {profile.bio ? (
                      <>
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        {profile.bio}
                      </>
                    ) : (
                      'No bio set. Add one to personalize your profile!'
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex gap-2 pt-4">
                <Badge variant={profile.bio ? 'default' : 'secondary'}>
                  {profile.bio ? 'Profile Complete' : 'Add Bio to Complete'}
                </Badge>
                <Badge variant="outline">Member since {new Date().getFullYear()}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg ">
                <User className="h-5 w-5" />
                Update Password
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Change your account password. Requires current password.
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setPasswordDialogOpen(true)} className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="connections" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg ">
                <User className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your email addresses and social connections.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Email Addresses</h4>
                {user?.emailAddresses?.length ? (
                  <div className="space-y-2">
                    {user.emailAddresses.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span>{email.emailAddress}</span>
                        <Badge variant={email.verification?.status === 'verified' ? 'default' : 'secondary'}>
                          {email.verification?.status || 'unverified'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No email addresses connected.</p>
                )}
              </div>
              {/* <div>
                <h4 className="font-semibold mb-2">Social Connections</h4>
                {user?.externalAccounts?.length ? (
                  <div className="space-y-2">
                    {user.externalAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span>{account.provider}</span>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleConnectProvider('google')}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Connect Google
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleConnectProvider('github')}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Connect GitHub
                    </Button>
                  </div>
                )}
              </div> */}
              {/* <Button variant="outline" className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Manage Connections (Clerk)
              </Button> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>
              Enter your current password and new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={loading}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;

