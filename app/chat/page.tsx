'use client';

import * as react from 'react';
import { useRouter } from 'next/navigation';
import { ChatProvider } from '@/lib/chat-context';
import { SettingsProvider } from '@/lib/settings-context';
import { ConversationSidebar } from '@/components/conversation-sidebar';
import { ChatMain } from '@/components/chat-main';
import { PresencePanel } from '@/components/presence-panel';

function ChatLayout() {
  return (
    <div className="flex h-screen bg-background">
      <ConversationSidebar />
      <ChatMain />
      <PresencePanel />
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = react.useState(false);
  const [isLoading, setIsLoading] = react.useState(true);

  react.useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthed(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <SettingsProvider>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </SettingsProvider>
  );
}
