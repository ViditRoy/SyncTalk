'use client';

import { useChat } from '@/lib/chat-context';
import { Conversation, getAllUsers } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

function getDirectConversationName(conv: Conversation, currentUserId: string | null, users: { id: string; username: string }[]) {
  if (!conv.isDirect || !currentUserId) return conv.name;

  const otherUserId = conv.recipientId === currentUserId
    ? conv.members.find((id) => id !== currentUserId)
    : conv.recipientId;

  const otherUser = users.find((user) => user.id === otherUserId);
  return otherUser?.username || conv.name;
}

export function ConversationSidebar() {
  const { conversations, activeConversation, setActiveConversation, createDirectMessage, createGroupConversation, getUnreadCount } = useChat();
  const [showUsers, setShowUsers] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
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

  const getConversationDisplayName = (conv: Conversation) =>
    getDirectConversationName(conv, currentUser?.id ?? null, allUsers);

  const handleUserSelect = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    createDirectMessage(userId, user?.username);
    setShowUsers(false);
  };

  const toggleGroupMember = (userId: string) => {
    setSelectedMembers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const resetGroupForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedMembers([]);
    setGroupError(null);
  };

  const handleCreateGroup = async () => {
    setGroupError(null);

    if (groupName.trim().length < 2) {
      setGroupError('Group name needs at least 2 characters.');
      return;
    }

    if (selectedMembers.length === 0) {
      setGroupError('Choose at least one other member.');
      return;
    }

    setIsCreatingGroup(true);
    const result = await createGroupConversation(groupName.trim(), selectedMembers, groupDescription.trim());
    setIsCreatingGroup(false);

    if (!result.success) {
      setGroupError(result.error || 'Unable to create group.');
      return;
    }

    resetGroupForm();
    setShowGroupForm(false);
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
              const displayName = getConversationDisplayName(conv);
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
                  <div className="font-semibold text-sm">@ {displayName}</div>
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
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            setShowUsers(!showUsers);
            setShowGroupForm(false);
          }}
        >
          + New Message
        </Button>
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            setShowGroupForm(!showGroupForm);
            setShowUsers(false);
            setGroupError(null);
          }}
        >
          + New Group
        </Button>

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

        {showGroupForm && (
          <div className="bg-muted p-3 rounded-lg space-y-3">
            <div className="space-y-2">
              <Input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                maxLength={40}
                placeholder="Group name"
              />
              <Input
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
                maxLength={160}
                placeholder="Description"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {allAvailableUsers.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2">No other users</div>
              ) : (
                allAvailableUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 rounded px-2 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(user.id)}
                      onCheckedChange={() => toggleGroupMember(user.id)}
                    />
                    <span className="truncate">{user.username}</span>
                  </label>
                ))
              )}
            </div>

            {groupError && (
              <div className="text-xs text-destructive">{groupError}</div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={isCreatingGroup}
                onClick={handleCreateGroup}
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  resetGroupForm();
                  setShowGroupForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
