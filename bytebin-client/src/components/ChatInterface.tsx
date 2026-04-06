import React, { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@/types/user";
import { useWebSocket } from "@/hooks/useWebSocket";
import { chatService } from "@/api/chatService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface BytebinUser {
  id: string;
  username: string;
  email: string;
}

export function ChatInterface({ recipientId, recipientName, recipientAvatar }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { isConnected, sendMessage, addMessageHandler, getUserStatus } =
    useWebSocket();
  const [owner, setOwner] = useState<string>();

  // get id only
  const bytebinUserRaw = localStorage.getItem("bytebin_user");
  const bytebinUser = bytebinUserRaw ? JSON.parse(bytebinUserRaw) : null;
  const userId = bytebinUser?.id || null;

  console.log("byte user: ", userId);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed;
      } catch (e) {
        console.error("Session parse error:", e);
        return null;
      }
    }
    console.log("No session in localStorage");
    return null;
  };

  const currentUser = getCurrentUser() as User | null;
  const isLoggedIn = (() => {
    try {
      const session = localStorage.getItem("session");
      return session ? JSON.parse(session)?.isLoggedIn === true : false;
    } catch {
      return false;
    }
  })();

  // Add this useEffect anywhere in your component
useEffect(() => {
  // When roomId changes, refetch messages
  if (roomId) {
    const refreshMessages = async () => {
      try {
        const messagesResponse = await chatService.getMessages(roomId);
        setMessages(messagesResponse.messages || []);
      } catch (error) {
        console.error("Failed to refresh messages:", error);
      }
    };
    
    refreshMessages();
  }
}, [roomId]); // This runs when roomId is set/updated

  useEffect(() => {
    const updatedUser = getCurrentUser();
    if (updatedUser?._id) {
      setOwner(updatedUser._id);
    }
  }, []);

  // Load conversation and messages
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        // Get or create conversation
        console.log(
          "🔄 Initializing chat for recipientId:",
          recipientId,
          "currentUser:",
          currentUser?._id,
        );
        const convResponse =
          await chatService.getOrCreateConversation(recipientId);
        console.log("Conversation API response:", convResponse);

        if (!convResponse?.conversation?._id) {
          throw new Error("No conversation ID received from server");
        }

        const conversationId = convResponse.conversation._id;
        setRoomId(conversationId);
        console.log("✅ roomId set:", conversationId);

        // Load messages
        const messagesResponse = await chatService.getMessages(conversationId);
        setMessages(messagesResponse.messages || []);

        // Join WebSocket room
        if (isConnected) {
          sendMessage("join-room", { roomId: conversationId });
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipientId) {
      initChat();
    }
  }, [recipientId, isConnected, sendMessage]);

  // Handle incoming messages
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (data.message?.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.id !== data.message.id),
        );
      }
    };

    const handleTyping = (data) => {
      if (data.userId === recipientId) {
        setRecipientTyping(data.isTyping);
        // Clear typing indicator after 1.5 seconds if no update
        if (data.isTyping) {
          setTimeout(() => {
            setRecipientTyping(false);
          }, 1500);
        }
      }
    };
    const handleUserStatus = (data) => {
      if (data.userId === recipientId) {
        setIsRecipientOnline(data.status === "online");

        // If recipient comes online, resend any pending messages
        if (data.status === "online" && pendingMessages.length > 0) {
          pendingMessages.forEach((pendingMsg) => {
            sendMessage("send-message", {
              roomId,
              content: pendingMsg.content,
              isRetry: true,
            });
          });
        }
      }
    };

    const removeNewMessageHandler = addMessageHandler(
      "new-message",
      handleNewMessage,
    );
    const removeTypingHandler = addMessageHandler("user-typing", handleTyping);
    const removeStatusHandler = addMessageHandler(
      "user-status",
      handleUserStatus,
    );

    return () => {
      removeNewMessageHandler();
      removeTypingHandler();
      removeStatusHandler();
    };
  }, [roomId, recipientId, addMessageHandler, sendMessage, pendingMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      console.log("Send blocked: empty message");
      return;
    }
    if (!roomId) {
      console.error(
        "Send blocked: no roomId. recipientId:",
        recipientId,
        "currentUser:",
        currentUser,
      );
      return;
    }

    const messageContent = inputMessage.trim();
    const tempId = Date.now().toString();

    console.log(
      "✅ Sending message:",
      messageContent,
      "roomId:",
      roomId,
      "connected:",
      isConnected,
    );

    // Optimistic UI update
    const optimisticMessage = {
      id: tempId,
      roomId,
      senderId: currentUser?._id,
      senderName: currentUser?.username || "Unknown",
      content: messageContent,
      createdAt: new Date(),
      status: "sending",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    let sendSuccess = false;

    // Try WebSocket first if connected
    if (isConnected) {
      const wsSuccess = sendMessage("send-message", {
        roomId,
        content: messageContent,
      });
      console.log("WS send result:", wsSuccess);
      if (wsSuccess) {
        sendSuccess = true;
        // Update status to sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: "sent" } : msg,
          ),
        );
      }
    }

    // Fallback to HTTP API if WS failed or not connected
    if (!sendSuccess) {
      try {
        console.log("Trying HTTP API fallback...");
        await chatService.sendMessage(roomId, messageContent);
        sendSuccess = true;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: "sent" } : msg,
          ),
        );
      } catch (error) {
        console.error("HTTP send failed:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: "failed" } : msg,
          ),
        );
        // Add to pending for retry when online
        setPendingMessages((prev) => [
          ...prev,
          { id: tempId, roomId, content: messageContent },
        ]);
      }
    }

    setInputMessage("");
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    if (!roomId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    sendMessage("typing", {
      roomId,
      isTyping: true,
    });

    typingTimeoutRef.current = setTimeout(() => {
      sendMessage("typing", {
        roomId,
        isTyping: false,
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-secondary">
        <Avatar className="h-10 w-10 border border-gray-600">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback>
            {recipientName?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {recipientName} {recipientId}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isRecipientOnline ? "🟢 Online" : "🔴 Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">
              {isRecipientOnline
                ? "Send a message to start the conversation"
                : "Messages will be delivered when recipient comes online"}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            // Convert both to strings for proper comparison
            const msgSenderId = String(msg.senderId);
            const currentUserId = userId;
            const isOwnMessage = msgSenderId === userId;

            console.log("Message comparison => :", {
              msgSenderId,
              currentUserId,
              isOwnMessage,
              content: msg.content,
            });

            return (
              <div
                key={msg.id || msg._id || idx}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {recipientTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-secondary">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            variant={isConnected ? "default" : "outline"}
          >
            <Send className="h-4 w-4" />
            {!isConnected && <span className="sr-only">(Offline mode)</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
