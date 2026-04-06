const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { saveMessage } = require('./controllers/chatController');
const { Conversation } = require('./models/Chat');

// Store connected clients - declared ONCE at the top level
const clients = new Map(); // userId -> { ws, userName, status, lastSeen }

function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });
  
  console.log('🔌 WebSocket server initializing...');
  
  wss.on('connection', (ws, req) => {
    console.log('🔗 New WebSocket connection attempt');
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    console.log('Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    
    if (!token) {
      console.log('❌ No token provided, closing connection');
      ws.close(1008, 'No token provided');
      return;
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.username || decoded.id);
      
      ws.userId = decoded.id;
      ws.userName = decoded.username || 'Unknown';
      
      // Store client with status
      clients.set(ws.userId, {
        ws: ws,
        userName: ws.userName,
        status: 'online',
        lastSeen: new Date()
      });
      
      console.log(`✅ User ${ws.userName} (${ws.userId}) connected`);
      console.log(`📊 Total online users: ${clients.size}`);
      console.log(`👥 Online users: ${Array.from(clients.keys()).join(', ')}`);
      
      // Broadcast online status to ALL other connected users (excluding self)
      broadcastToAllUsersExcept({
        type: 'user-status',
        userId: ws.userId,
        userName: ws.userName,
        status: 'online',
        timestamp: new Date()
      }, ws.userId);
      
      // Send current online status of all users to the newly connected user
      sendCurrentOnlineStatus(ws);
      
    } catch (error) {
      console.error('❌ WebSocket auth error:', error.message);
      ws.close(1008, 'Invalid token');
      return;
    }
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 Received message type:', message.type);
        
        switch (message.type) {
          case 'join-room':
            ws.roomId = message.roomId;
            console.log(`User ${ws.userName} joined room: ${message.roomId}`);
            break;
            
          case 'send-message':
            await handleSendMessage(ws, message);
            break;
            
          case 'typing':
            handleTypingIndicator(ws, message);
            break;
            
          case 'mark-read':
            await handleMarkAsRead(ws, message);
            break;
          
          case 'get-online-status':
            handleGetOnlineStatus(ws, message);
            break;
          
          case 'ping':
            // Respond to ping to keep connection alive
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
        }
      } catch (error) {
        console.error('Message handling error:', error);
      }
    });
    
    ws.on('close', () => {
      if (ws.userId) {
        const user = clients.get(ws.userId);
        if (user) {
          user.status = 'offline';
          user.lastSeen = new Date();
        }
        clients.delete(ws.userId);
        console.log(`❌ User ${ws.userName} disconnected`);
        console.log(`📊 Total online users: ${clients.size}`);
        
        // Broadcast offline status to ALL other connected users
        broadcastToAllUsersExcept({
          type: 'user-status',
          userId: ws.userId,
          userName: ws.userName,
          status: 'offline',
          timestamp: new Date()
        }, ws.userId);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Function to broadcast to ALL connected users EXCEPT a specific user
  function broadcastToAllUsersExcept(data, excludeUserId) {
    const message = JSON.stringify(data);
    let sentCount = 0;
    
    for (const [userId, client] of clients) {
      if (userId !== excludeUserId && client.ws.readyState === 1) {
        client.ws.send(message);
        sentCount++;
      }
    }
    
    console.log(`📡 Broadcasted ${data.type} to ${sentCount} users (excluded: ${excludeUserId})`);
  }
  
  // Send current online status of all users to a newly connected user
  function sendCurrentOnlineStatus(ws) {
    const onlineUsers = [];
    
    for (const [userId, client] of clients) {
      if (userId !== ws.userId && client.status === 'online') {
        onlineUsers.push({
          userId: userId,
          userName: client.userName,
          status: 'online'
        });
      }
    }
    
    if (onlineUsers.length > 0) {
      ws.send(JSON.stringify({
        type: 'online-users',
        users: onlineUsers,
        timestamp: new Date()
      }));
      console.log(`📡 Sent current online users (${onlineUsers.length}) to ${ws.userName}`);
    }
  }
  
  // Get online status of a specific user
  function handleGetOnlineStatus(ws, { userId }) {
    const targetUser = clients.get(userId);
    const isOnline = targetUser && targetUser.status === 'online';
    
    console.log(`🔍 Status check for ${userId}: ${isOnline ? 'online' : 'offline'}`);
    
    ws.send(JSON.stringify({
      type: 'user-status',
      userId: userId,
      status: isOnline ? 'online' : 'offline',
      timestamp: new Date()
    }));
  }
  
  async function handleSendMessage(ws, message) {
    try {
      const messageData = {
        roomId: message.roomId,
        senderId: ws.userId,
        senderName: ws.userName || 'Unknown',
        content: message.content,
        readBy: [ws.userId],
        createdAt: new Date()
      };
      
      const savedMessage = await saveMessage(messageData);
      
      const conversation = await Conversation.findById(message.roomId);
      if (!conversation) return;
      
      const recipientId = conversation.participants.find(
        p => p.toString() !== ws.userId
      );
      
      if (recipientId) {
        const recipientClient = clients.get(recipientId.toString());
        if (recipientClient && recipientClient.ws.readyState === 1) {
          recipientClient.ws.send(JSON.stringify({
            type: 'new-message',
            message: {
              ...savedMessage.toObject(),
              id: savedMessage._id
            }
          }));
          console.log(`💬 Message sent from ${ws.userName} to ${recipientId}`);
        } else {
          console.log(`📨 User ${recipientId} is offline, message saved to database`);
        }
      }
      
      ws.send(JSON.stringify({
        type: 'message-sent',
        message: {
          ...savedMessage.toObject(),
          id: savedMessage._id
        }
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message'
      }));
    }
  }
  
  function handleTypingIndicator(ws, message) {
    const { roomId, isTyping } = message;
    
    Conversation.findById(roomId).then(conversation => {
      if (!conversation) return;
      
      const recipientId = conversation.participants.find(
        p => p.toString() !== ws.userId
      );
      
      if (recipientId) {
        const recipientClient = clients.get(recipientId.toString());
        if (recipientClient && recipientClient.ws.readyState === 1) {
          recipientClient.ws.send(JSON.stringify({
            type: 'user-typing',
            userId: ws.userId,
            userName: ws.userName,
            isTyping
          }));
        }
      }
    }).catch(console.error);
  }
  
  async function handleMarkAsRead(ws, { roomId }) {
    try {
      const { Message } = require('./models/Chat');
      await Message.updateMany(
        { roomId, readBy: { $ne: ws.userId } },
        { $addToSet: { readBy: ws.userId } }
      );
      
      const conversation = await Conversation.findById(roomId);
      if (conversation) {
        conversation.unreadCount[ws.userId] = 0;
        await conversation.save();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
  
  return wss;
}

module.exports = { setupWebSocketServer };