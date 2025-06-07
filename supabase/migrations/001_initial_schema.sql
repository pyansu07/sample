-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR NOT NULL,
    name VARCHAR,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')) NOT NULL,
    message_type VARCHAR(10) DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = auth0_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = auth0_id);

CREATE POLICY "Users can view own chats" ON chats FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text));
CREATE POLICY "Users can create own chats" ON chats FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text));
CREATE POLICY "Users can update own chats" ON chats FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text));
CREATE POLICY "Users can delete own chats" ON chats FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Users can view messages from own chats" ON messages FOR SELECT USING (chat_id IN (SELECT id FROM chats WHERE user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)));
CREATE POLICY "Users can create messages in own chats" ON messages FOR INSERT WITH CHECK (chat_id IN (SELECT id FROM chats WHERE user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)));
