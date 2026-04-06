
const express = require('express');
const auth  = require('../middleware/auth');
const { 
  getOrCreateConversation, 
  getMessages, 
  getConversations,
  saveMessageHttp 
} = require('../controllers/chatController');

const router = express.Router();

// All chat routes require authentication
router.use(auth);

router.get('/conversations', getConversations);
router.get('/conversation/:userId', getOrCreateConversation);
router.get('/messages/:roomId', getMessages);
router.post('/messages/:roomId', saveMessageHttp);

module.exports = router;
