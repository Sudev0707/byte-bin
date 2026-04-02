import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api/axios';
import { 
  Avatar, AvatarFallback, AvatarImage 
} from '@/components/ui/avatar';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  imageUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  problemsSolved: number;
  createdAt: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userQuery = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID required');
      const response = await axiosInstance.get(`/api/users/${id}`, {
      });
      return response.data as UserProfile;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (userQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <User className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">This user profile doesn't exist.</p>
        <Button onClick={() => navigate('/search')} variant="outline">
          Back to Search
        </Button>
      </div>
    );
  }

  const user = userQuery.data;
  const initials = (user.name[0] || 'U').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="h-24 w-24 text-2xl bg-gradient-to-br from-violet-400 to-purple-500">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold font-display">{user.name}</h1>
        <p className="text-xl text-muted-foreground">@{user.username}</p>
        <Badge className="mt-2 px-4 py-1 text-lg font-semibold">
          {user.problemsSolved.toLocaleString()} problems solved
        </Badge>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 p-6">
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{user.problemsSolved}</div>
            <div className="text-sm text-muted-foreground">Problems Solved</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">Member since</div>
            <div className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span>{user.email || 'Email not public'}</span>
          </div>
          {user.firstName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span>{user.firstName} {user.lastName}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button asChild className="flex-1">
          <a href={`mailto:${user.email}`} className="w-full text-center">
            Send Message
          </a>
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
          Back
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;

