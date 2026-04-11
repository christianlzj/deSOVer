import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function Messages({ userId, selectedFriendId: propSelectedFriendId, selectedFriendName: propSelectedFriendName }) {
  const [view, setView] = useState('inbox'); // inbox | chat
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState(null);

  // When a friend is selected from a recommendation card, auto-switch to chat view
  useEffect(() => {
    if (propSelectedFriendId) {
      setSelectedFriendId(propSelectedFriendId);
      setLocalMessages(null);
      setView('chat');
    }
  }, [propSelectedFriendId]);

  // Fetch inbox
  const { data: inboxData, loading: inboxLoading, error: inboxError } = useFetch(
    `${API_BASE}/users/${userId}/inbox`
  );

  // Fetch messages for selected friend
  const { data: messagesData, loading: messagesLoading, error: messagesError } = useFetch(
    selectedFriendId ? `${API_BASE}/users/${userId}/messages/${selectedFriendId}` : null
  );

  // Sync local messages from fetched data; reset when switching friends
  useEffect(() => {
    setLocalMessages(null);
  }, [selectedFriendId]);

  useEffect(() => {
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages);
    }
  }, [messagesData]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedFriendId) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: selectedFriendId,
          content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLocalMessages(prev => [...(prev || []), {
          message_id: result.message_id,
          sender_id: userId,
          recipient_id: selectedFriendId,
          content: content,
          created_at: result.created_at,
          read: false,
          sender_name: '',
        }]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (view === 'inbox') {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2D4A3E', marginBottom: '15px' }}>
            💬 Messages
          </h2>
        </div>

        {inboxLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Loading conversations...
          </div>
        ) : inboxError ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#C45C3A' }}>
            Error loading messages
          </div>
        ) : !inboxData?.conversations || inboxData.conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No messages yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inboxData.conversations.map((conv) => (
              <button
                key={conv.friend_id}
                onClick={() => {
                  setSelectedFriendId(conv.friend_id);
                  setView('chat');
                }}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid rgba(45,74,62,0.1)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: conv.unread_count > 0 ? '0 2px 8px rgba(184,224,106,0.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9f9f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A2B24', marginBottom: '4px' }}>
                    {conv.friend_name}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conv.is_sender ? 'You: ' : ''}{conv.last_message}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <div
                    style={{
                      background: '#B8E06A',
                      color: '#2D4A3E',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '600',
                      flexShrink: 0,
                      marginLeft: '10px',
                    }}
                  >
                    {conv.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Chat view
  const selectedFriend = inboxData?.conversations?.find((c) => c.friend_id === selectedFriendId);
  const displayName = selectedFriend?.friend_name || propSelectedFriendName || 'Chat';
  const displayMessages = localMessages ?? messagesData?.messages;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(45,74,62,0.1)' }}>
        <button
          onClick={() => setView('inbox')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#2D4A3E',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#2D4A3E', margin: 0 }}>
          {displayName}
        </h2>
        <div style={{ width: '60px' }} />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messagesLoading ? (
          <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>
        ) : !displayMessages || displayMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999' }}>No messages yet</div>
        ) : (
          displayMessages.map((msg) => (
            <div
              key={msg.message_id}
              style={{
                display: 'flex',
                justifyContent: msg.sender_id === userId ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  background: msg.sender_id === userId ? '#2D4A3E' : '#E8F5E9',
                  color: msg.sender_id === userId ? '#B8E06A' : '#2D4A3E',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(45,74,62,0.2)',
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={sending || !messageInput.trim()}
          style={{
            padding: '10px 16px',
            background: messageInput.trim() ? '#2D4A3E' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
