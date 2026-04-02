

email flow
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP FORM (Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│  Username: john_doe                                         │
│  Email: john@gmail.com  ← User types ANY email here         │
│  Password: ********                                         │
│  [SIGN UP]                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    YOUR BACKEND (Node.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Receives: { email: "john@gmail.com" }                      │
│                                                             │
│  Sends email using:                                         │
│  FROM: bytebin@gmail.com (YOUR static email from .env)      │
│  TO: john@gmail.com (User's email from form) ← DYNAMIC!    │
│  SUBJECT: Your OTP Code                                     │
│  BODY: Your code is 123456                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              USER'S EMAIL INBOX (john@gmail.com)            │
├─────────────────────────────────────────────────────────────┤
│  From: ByteBin <bytebin@gmail.com>                          │
│  To: john@gmail.com                                         │
│  Subject: Your OTP Code                                     │
│                                                             │
│  Your code is: 123456                                       │
└─────────────────────────────────────────────────────────────┘