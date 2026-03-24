'use client';

import { useChat } from '@/lib/chat-context';
import { Conversation, getAllUsers } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';

export function ConversationSidebar() {
  const { conversations, activeConversation, setActiveConversation, createDirectMessage, getUnreadCount } = useChat();
  const [showUsers, setShowUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Load current user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users);
    };
    loadUsers();
  }, []);

  const groupConversations = conversations.filter((c) => !c.isDirect);
  const directMessages = conversations.filter((c) => c.isDirect);

  // Get all available users (including newly created ones)
  const allAvailableUsers = useMemo(() => {
    return allUsers.filter((u) => u.id !== currentUser?.id);
  }, [allUsers, currentUser?.id]);

  const handleUserSelect = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    createDirectMessage(userId, user?.username);
    setShowUsers(false);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {/* Group Conversations */}
        {groupConversations.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Channels
            </div>
            {groupConversations.map((conv) => {
              const unreadCount = getUnreadCount(conv.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                    activeConversation?.id === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm"># {conv.name}</div>
                    {conv.description && (
                      <div className="text-xs opacity-75 truncate">{conv.description}</div>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
                      activeConversation?.id === conv.id
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {unreadCount}
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}

        {/* Direct Messages */}
        {directMessages.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">
              Direct Messages
            </div>
            {directMessages.map((conv) => {
              const unreadCount = getUnreadCount(conv.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                    activeConversation?.id === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-semibold text-sm">@ {conv.name}</div>
                  {unreadCount > 0 && (
                    <div className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
                      activeConversation?.id === conv.id
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {unreadCount}
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="w-full bg-secondary text-secondary-foreground py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          + New Message
        </button>

        {showUsers && (
          <div className="bg-muted p-2 rounded-lg space-y-1 max-h-40 overflow-y-auto">
            {allAvailableUsers.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2">No other users</div>
            ) : (
              allAvailableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className="w-full text-left px-3 py-2 rounded text-sm text-foreground hover:bg-secondary transition"
                >
                  {user.username}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
