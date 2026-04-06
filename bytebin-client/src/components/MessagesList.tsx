import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageCircle, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { chatService } from '@/api/chatService';

interface ChatUser {
  id: string;
  username: string;
  imageUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  conversationId?: string;
}

interface MessagesListProps {
  onSelectChat: (chat: ChatUser) => void;
  className?: string;
}

export function MessagesList({ onSelectChat, className }: MessagesListProps) {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = () => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getConversations();
      console.log('Fetched conversations:', response);
      
      // Process actual API response structure
      const conversations = response.conversations || [];
      
      const userChats: ChatUser[] = conversations
        .filter((conv: any) => conv.otherParticipant) // Only show conversations with other participant
        .map((conv: any) => ({
          id: conv.otherParticipant._id,
          username: conv.otherParticipant.username,
          imageUrl: conv.otherParticipant.avatar || conv.otherParticipant.imageUrl,
          lastMessage: conv.lastMessage || 'No messages yet',
          lastMessageTime: conv.lastMessageTime || conv.updatedAt,
          unreadCount: conv.unreadCount || 0,
          isOnline: false, // You can set this via WebSocket later
          conversationId: conv._id,
        }));
      
      console.log('Processed chats:', userChats);
      setChats(userChats);
      setFilteredChats(userChats);
      
      // If no real conversations, show demo data
      if (userChats.length === 0) {
        const demoChats: ChatUser[] = [
          {
            id: 'demo1',
            username: 'Demo User',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
            lastMessage: 'Welcome to chat! Start a conversation by messaging someone.',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isOnline: true,
            conversationId: 'demo-room-1'
          }
        ];
        setChats(demoChats);
        setFilteredChats(demoChats);
      }
    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
      setError(err.message || 'Failed to load conversations');
      
      // Show demo data on error
      const demoChats: ChatUser[] = [
        {
          id: 'demo1',
          username: 'Demo User',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop',
          lastMessage: 'Unable to load conversations. Please try again.',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isOnline: true,
          conversationId: 'demo-room-1'
        }
      ];
      setChats(demoChats);
      setFilteredChats(demoChats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSelectChat = (chat: ChatUser) => {
    onSelectChat({
      id: chat.id,
      username: chat.username,
      imageUrl: chat.imageUrl,
      conversationId: chat.conversationId
    });
  };

  if (loading) {
    return (
      <div className={cn('flex flex-col h-full bg-secondary border-r', className)}>
        <div className="p-4 border-b">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <h2 className="font-semibold text-lg flex-1">Messages</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-center text-destructive text-sm">
          <p>{error}</p>
          <Button variant="link" onClick={fetchChats} size="sm" className="mt-1">
            Try Again
          </Button>
        </div>
      )}

      {/* Chats List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a conversation with another user</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => handleSelectChat(chat)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={chat.imageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-sm font-bold">
                        {chat.username?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">
                        {chat.username}
                      </p>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 text-xs bg-primary flex-shrink-0">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}