import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInterface } from "@/components/ChatInterface";
import {
  User,
  Mail,
  Calendar,
  Award,
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  MessageCircle,
  TrendingUp,
  Activity,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { getSession } from "@/utils/localStorage"; // Import to check current user

interface UserProfileData {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  dateJoined: string;
  createdAt: string;
  problemsSolved: number;
  followersCount: number;
  followingCount: number;
  sharedCount: number;
  isFollowing: boolean;
  recentProblems: Array<{
    _id?: string;
    title: string;
    topic: string;
    difficulty: string;
    createdAt: string;
  }>;
}

interface FollowersResponse {
  followers: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
}

interface FollowingResponse {
  following: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();



  // Get current user to check if viewing own profile
  const currentSession = getSession();
  const isOwnProfile = currentSession?.id === id;

    console.log("🔍 UserProfile Debug:", {
    urlParamId: id,
    currentSessionId: currentSession?.id,
    isOwnProfile: isOwnProfile,
    typeOfUrlId: typeof id,
    typeOfSessionId: typeof currentSession?.id,
  });

  // Fetch user profile
  const profileQuery = useQuery({
    queryKey: ["userProfile", id],
    queryFn: async () => {
      if (!id) throw new Error("User ID required");
      // console.log("Fetching user profile for ID:", id);
      const response = await userService.getUserById(id);
      console.log("Profile response:", response);
      return response.user as UserProfileData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch followers
  const followersQuery = [];
  // const followersQuery = useQuery({
  //   queryKey: ['followers', id],
  //   queryFn: async () => {
  //     if (!id) throw new Error('User ID required');
  //     const response = await userService.getFollowers(id);
  //     return response as FollowersResponse;
  //   },
  //   enabled: !!id && !!profileQuery.data,
  // });

  // Fetch following
  const followingQuery = [];
  // const followingQuery = useQuery({
  //   queryKey: ['following', id],
  //   queryFn: async () => {
  //     if (!id) throw new Error('User ID required');
  //     const response = await userService.getFollowing(id);
  //     return response as FollowingResponse;
  //   },
  //   enabled: !!id && !!profileQuery.data,
  // });

  // Follow/Unfollow mutation
  const followMutation = [];
  // const followMutation = useMutation({
  //   mutationFn: async (shouldFollow: boolean) => {
  //     if (shouldFollow) {
  //       return await userService.followUser(id!);
  //     } else {
  //       return await userService.unfollowUser(id!);
  //     }
  //   },
  //   onMutate: async (shouldFollow) => {
  //     await queryClient.cancelQueries({ queryKey: ['userProfile', id] });

  //     const previousProfile = profileQuery.data;

  //     if (previousProfile) {
  //       queryClient.setQueryData(['userProfile', id], {
  //         ...previousProfile,
  //         isFollowing: shouldFollow,
  //         followersCount: shouldFollow
  //           ? previousProfile.followersCount + 1
  //           : previousProfile.followersCount - 1,
  //       });
  //     }

  //     return { previousProfile };
  //   },
  //   onError: (err, shouldFollow, context) => {
  //     if (context?.previousProfile) {
  //       queryClient.setQueryData(['userProfile', id], context.previousProfile);
  //     }
  //     toast({
  //       title: "Error",
  //       description: "Failed to update follow status. Please try again.",
  //       variant: "destructive",
  //     });
  //     console.error('Follow mutation error:', err);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
  //     queryClient.invalidateQueries({ queryKey: ['followers', id] });
  //     queryClient.invalidateQueries({ queryKey: ['following', id] });
  //   },
  // });

  // const handleFollow = () => {
  //   if (!currentSession?.isLoggedIn) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please login to follow users.",
  //       variant: "destructive",
  //     });
  //     navigate('/login');
  //     return;
  //   }

  //   if (isOwnProfile) {
  //     toast({
  //       title: "Action Not Allowed",
  //       description: "You cannot follow yourself.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   followMutation.mutate(!profileQuery.data?.isFollowing);
  // };

  // Show loading state
  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  // Show error state
  if (profileQuery.error) {
    console.error("Profile query error:", profileQuery.error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <User className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-2xl font-bold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          The user profile you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/search")} variant="outline">
            Back to Search
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-bold mb-2">No Data</h3>
        <p className="text-muted-foreground mb-6">
          Unable to load profile data.
        </p>
        <Button onClick={() => profileQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  const user = profileQuery.data;
  const initials = user.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="container mx-auto space-y-0 md:p-6 lg:p-0 max-w-6xl min-h-screen">
      <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
        {"<"} Back
      </Button>
      <div className="flex flex-wrap border  ">
        <div className="flex flex-col w-[30%] p-2 gap-4  rounded-lg sticky ">
          {/* Header */}
          <div className="text-center mb-8">
            <Avatar className="h-24 w-24 mx-auto mb-6 ring-4 ring-background shadow-lg">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="h-24 w-24 text-4xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl md:text-2xl font-bold font-display bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
              {user.username}
            </h1>
            <p>{user._id}</p>
            <p className="text-muted-foreground mb-4">
              Member since {new Date(user.dateJoined).toLocaleDateString()}
            </p>

            <div className="flex flex-col gap-2 justify-center mb-6 px-6">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Award className="mr-1 h-4 w-4" />
                {user.problemsSolved?.toLocaleString() || 0} solved
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Users className="mr-1 h-4 w-4" />
                {user.followersCount || 0} followers
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Share2 className="mr-1 h-4 w-4" />
                {user.sharedCount || 0} shared
              </Badge>
            </div>

            <div className="flex flex-col ustify-center max-w-md mx-auto px-6"></div>

            <div className="flex flex-col sm:flex-row gap-3 px-5 justify-center max-w-md mx-auto">
              {false && (
                <Button
                  size="lg"
                  className="flex-1 font-semibold"
                  onClick={() => {}}
                  disabled={false}
                >
                  Follow
                </Button>
              )}
              <Button
                variant="default"
                size="lg"
                className="flex-1 rounded-3xl py-2"
                onClick={() => setActiveTab("chat")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
        <div className=" w-[70%] p-0 gap-4">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-14">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {/* <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger> */}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span>
                      Joined {new Date(user.dateJoined).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats */}
            <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                  <CardDescription>
                    Key metrics and activity overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 px-4 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
                  <div className="group p-6 rounded-xl hover:bg-muted/50 transition-all border cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {user.problemsSolved?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Problems Solved
                    </div>
                  </div>

                  <div className="group p-6 rounded-xl hover:bg-muted/50 transition-all border cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors flex items-center justify-center">
                        <Users className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {user.followersCount || 0}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Followers
                    </div>
                  </div>

                  <div className="group p-6 rounded-xl hover:bg-muted/50 transition-all border cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100/50 group-hover:bg-blue-100/70 transition-colors flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {user.followingCount || 0}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Following
                    </div>
                  </div>

                  <div className="group p-6 rounded-xl hover:bg-muted/50 transition-all border cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-2xl bg-green-100/50 group-hover:bg-green-100/70 transition-colors flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {user.sharedCount || 0}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Problems Shared
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Problems */}
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Problems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.recentProblems && user.recentProblems.length > 0 ? (
                    <div className="space-y-3">
                      {user.recentProblems.map((problem, index) => (
                        <div
                          key={problem._id || index}
                          className=" border border-gray-700 flex items-center gap-4 p-2 hover:bg-muted rounded-xl group transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-md line-clamp-1">
                              {problem.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Badge
                                variant="outline"
                                className="px-2 py-1 text-xs"
                              >
                                {problem.topic}
                              </Badge>
                              <Badge
                                variant={
                                  problem.difficulty === "Easy"
                                    ? "default"
                                    : problem.difficulty === "Medium"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="px-2 py-1 text-xs"
                              >
                                {problem.difficulty}
                              </Badge>
                              <span className="text-xs">
                                ·{" "}
                                {new Date(
                                  problem.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:scale-110 transition-all"
                            onClick={() =>
                              problem._id
                                ? navigate(`/problem/${problem._id}`)
                                : null
                            }
                            title="View problem details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No recent problems</p>
                      <p className="text-sm">
                        This user hasn't solved any problems recently
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat with {user.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1">
                  <ChatInterface
                    recipientId={user._id}
                    recipientName={user.username}
                    recipientAvatar={user.avatar}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Following */}
            {/* <TabsContent value="following" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Following ({user.followingCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followingQuery.isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : followingQuery.data?.following?.length ? (
                <div className="space-y-2">
                  {followingQuery.data.following.map((followee) => (
                    <Button 
                      key={followee._id} 
                      variant="ghost" 
                      className="justify-start h-14 px-4 hover:bg-accent w-full text-left"
                      onClick={() => navigate(`/profile/${followee._id}`)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={followee.avatar} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500">
                          {followee.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{followee.username}</span>
                        <span className="text-sm text-muted-foreground">{followee.email}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  Not following anyone
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

            {/* Followers */}
            {/* <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Followers ({user.followersCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followersQuery.isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : followersQuery.data?.followers?.length ? (
                <div className="space-y-2">
                  {followersQuery.data.followers.map((follower) => (
                    <Button 
                      key={follower._id} 
                      variant="ghost" 
                      className="justify-start h-14 px-4 hover:bg-accent w-full text-left"
                      onClick={() => navigate(`/profile/${follower._id}`)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={follower.avatar} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-green-500 to-blue-500">
                          {follower.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{follower.username}</span>
                        <span className="text-sm text-muted-foreground">{follower.email}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No followers yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
