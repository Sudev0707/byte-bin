import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Code2, Loader2, Users } from "lucide-react";
import { userService } from "../api/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  problemsSolved?: number;
  isFollowing?: boolean;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search users when query changes
  useEffect(() => {
    if (q && q.trim().length >= 2) {
      searchUsers();
    } else if (q && q.trim().length < 2) {
      setUsers([]);
    }
  }, [q]);

  const searchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await userService.searchUsers(q, 20);
      setUsers(result.users || []);
      console.log("Search results:", result);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.response?.data?.message || "Failed to search users");
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await userService.followUser(userId);
      toast.success("User followed!");
      // Update the follow status in the UI
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isFollowing: true } : user,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await userService.unfollowUser(userId);
      toast.success("User unfollowed!");
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isFollowing: false } : user,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unfollow user");
    }
  };

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Search ByteBin</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Search for users by username or email. Enter a keyword above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">Search results for "{q}"</h1>
        </div>
        <Input
          defaultValue={q}
          placeholder="Refine search..."
          className="max-w-md sm:ml-auto border border-gray-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const newQ = (e.target as HTMLInputElement).value;
              navigate(`/search?q=${encodeURIComponent(newQ)}`, {
                replace: true,
              });
            }
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Searching users...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search failed</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={searchUsers} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  No users matching "{q}" were found
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <Card
                      key={user._id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white text-2xl">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {user.username}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {user.problemsSolved || 0} problems solved
                        </Badge>
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${user._id}`);
                            }}
                          >
                            View Profile
                          </Button>
                          {user.isFollowing ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnfollow(user._id);
                              }}
                            >
                              Following
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(user._id);
                              }}
                            >
                              Follow
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;
