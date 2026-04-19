import React, { useState } from 'react';

const MOCK_POSTS = [
  {
    id: 1,
    author: 'Sarah K.',
    avatar: 'S',
    avatarColor: '#5B8FA8',
    timeAgo: '2h ago',
    content: 'Just finished my first week of carpooling with Meagan to campus! Saved an estimated 12 lbs of CO₂ and split gas costs. Honestly the morning conversations make the commute way better too 🚗💚',
    likes: 14,
    liked: false,
    image: '1.png',
    tag: 'Carpool Win',
    comments: [
      { id: 1, author: 'Jake M.', avatar: 'J', avatarColor: '#4A7C59', content: 'Best carpool buddy! Next week we should try the express route 🛣️', timeAgo: '1h ago' },
      { id: 2, author: 'Maria L.', avatar: 'M', avatarColor: '#E8C547', content: 'That\'s awesome! I want to join if there\'s room!', timeAgo: '45m ago' },
    ]
  },
  {
    id: 2,
    author: 'David R.',
    avatar: 'D',
    avatarColor: '#C45C3A',
    timeAgo: '5h ago',
    content: 'Pro tip: If you\'re carpooling on I-85, the HOV lane saves about 15 minutes during rush hour. Our 4-person carpool has been crushing it this month! 📈',
    likes: 23,
    liked: true,
    image: '2.png',
    tag: 'Tip',
    comments: [
      { id: 3, author: 'Lin W.', avatar: 'L', avatarColor: '#7DB87A', content: 'The HOV lane is a game changer. We should have a group for the Midtown → Tech Square route!', timeAgo: '4h ago' },
    ]
  },
  {
    id: 3,
    author: 'Priya N.',
    avatar: 'P',
    avatarColor: '#7DB87A',
    timeAgo: '1d ago',
    content: 'Our carpool group hit 100 lbs of CO₂ saved together! 🌱🎉 Shoutout to Maria and David for being the most consistent riders. Let\'s keep this streak going!',
    likes: 31,
    liked: false,
    image: '3.png',
    tag: 'Milestone',
    comments: [
      { id: 4, author: 'David R.', avatar: 'D', avatarColor: '#C45C3A', content: 'Couldn\'t have done it without this group! 💪', timeAgo: '23h ago' },
      { id: 5, author: 'Maria L.', avatar: 'M', avatarColor: '#E8C547', content: '100 lbs!! Next stop: 500! 🌍', timeAgo: '22h ago' },
      { id: 6, author: 'Jake M.', avatar: 'J', avatarColor: '#4A7C59', content: 'This is so inspiring. Joining the challenge!', timeAgo: '20h ago' },
    ]
  },
  {
    id: 4,
    author: 'Alex T.',
    avatar: 'A',
    avatarColor: '#E8C547',
    timeAgo: '2d ago',
    content: 'Anyone commuting from Decatur to Georgia Tech around 8 AM on weekdays? Looking for carpool partners! I can drive Mon/Wed, looking for someone to cover Tue/Thu. DM me!',
    likes: 8,
    liked: false,
    image: null,
    tag: 'Looking for Riders',
    comments: [
      { id: 7, author: 'Sarah K.', avatar: 'S', avatarColor: '#5B8FA8', content: 'I\'m close to Decatur! Let me check my schedule and get back to you.', timeAgo: '1d ago' },
    ]
  },
];

const TAG_COLORS = {
  'Carpool Win': { bg: '#E8F5E9', text: '#2D7A32' },
  'Tip': { bg: '#FFF3E0', text: '#E65100' },
  'Milestone': { bg: '#E3F2FD', text: '#1565C0' },
  'Looking for Riders': { bg: '#FCE4EC', text: '#C62828' },
};

export default function SocialBoard({ onBack }) {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
          ...p,
          comments: [
            ...p.comments,
            {
              id: Date.now(),
              author: 'You',
              avatar: 'Y',
              avatarColor: '#2D4A3E',
              content: text,
              timeAgo: 'Just now'
            }
          ]
        }
        : p
    ));
    setNewComment(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          color: '#2D4A3E',
          padding: '4px 0',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        ← Back to Leaderboard
      </button>

      {/* Title card */}
      <div style={{
        background: 'linear-gradient(135deg, #2D4A3E 0%, #3D6352 100%)',
        borderRadius: '20px',
        padding: '18px 20px',
        border: '1px solid rgba(184,224,106,0.15)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>💬</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '20px',
          color: '#F5F0E8',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          Social Board
        </h2>
        <p style={{
          fontSize: '11px',
          color: 'rgba(184,224,106,0.7)',
          letterSpacing: '0.08em'
        }}>
          Share your carpooling stories & connect
        </p>
      </div>

      {/* Posts */}
      {posts.map((post) => {
        const tagColor = TAG_COLORS[post.tag] || { bg: '#F2F6F3', text: '#2D4A3E' };
        const isExpanded = expandedComments[post.id];
        const commentText = newComment[post.id] || '';

        return (
          <div
            key={post.id}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(45,74,62,0.07)',
              border: '1px solid rgba(45,74,62,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: 'white',
                fontFamily: "'DM Serif Display', serif",
                background: post.avatarColor,
                flexShrink: 0,
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
              }}>
                {post.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '600', fontSize: '13px', color: '#1A2B24' }}>
                  {post.author}
                </p>
                <p style={{ fontSize: '10.5px', color: '#8A9A8E' }}>
                  {post.timeAgo}
                </p>
              </div>
              {/* Tag */}
              <div style={{
                background: tagColor.bg,
                color: tagColor.text,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {post.tag}
              </div>
            </div>

            {/* Post content */}
            <p style={{
              fontSize: '13px',
              color: '#1A2B24',
              lineHeight: '1.55',
              letterSpacing: '0.01em'
            }}>
              {post.content}
            </p>

            {post.image && (
              <div style={{ marginTop: '4px', width: '100%' }}>
                <img
                  src={post.image}
                  alt="Post attachment"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            )}

            {/* Action bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '4px',
              borderTop: '1px solid rgba(45,74,62,0.06)'
            }}>
              {/* Like button */}
              <button
                onClick={() => toggleLike(post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: post.liked ? 'rgba(184,224,106,0.15)' : '#F2F6F3',
                  border: post.liked ? '1px solid rgba(184,224,106,0.4)' : '1px solid transparent',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: post.liked ? '#2D7A32' : '#8A9A8E',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{post.liked ? '💚' : '🤍'}</span>
                <span>{post.likes}</span>
              </button>

              {/* Comment toggle */}
              <button
                onClick={() => toggleComments(post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: isExpanded ? 'rgba(91,143,168,0.12)' : '#F2F6F3',
                  border: isExpanded ? '1px solid rgba(91,143,168,0.3)' : '1px solid transparent',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isExpanded ? '#1565C0' : '#8A9A8E',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                <span>💬</span>
                <span>{post.comments.length}</span>
              </button>
            </div>

            {/* Comments section */}
            {isExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingTop: '4px'
              }}>
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#FAFAF7',
                      borderRadius: '14px',
                      border: '1px solid rgba(45,74,62,0.04)'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'white',
                      fontFamily: "'DM Serif Display', serif",
                      background: comment.avatarColor,
                      flexShrink: 0
                    }}>
                      {comment.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: '600', fontSize: '11.5px', color: '#1A2B24' }}>
                          {comment.author}
                        </span>
                        <span style={{ fontSize: '10px', color: '#8A9A8E' }}>
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#3A4A42', lineHeight: '1.45' }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add comment input */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'white',
                    fontFamily: "'DM Serif Display', serif",
                    background: '#2D4A3E',
                    flexShrink: 0
                  }}>
                    Y
                  </div>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    gap: '6px',
                    background: '#F2F6F3',
                    borderRadius: '20px',
                    padding: '4px 4px 4px 12px',
                    border: '1px solid rgba(45,74,62,0.08)'
                  }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        fontSize: '12px',
                        color: '#1A2B24',
                        outline: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        minWidth: 0
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      style={{
                        background: commentText.trim() ? '#2D4A3E' : '#D4D0C8',
                        color: commentText.trim() ? '#B8E06A' : '#8A9A8E',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: commentText.trim() ? 'pointer' : 'default',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.15s ease',
                        flexShrink: 0
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom spacer */}
      <div style={{ height: '8px' }}></div>
    </div>
  );
}
