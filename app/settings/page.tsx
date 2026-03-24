'use client';

import { useRouter } from 'next/navigation';
import { useSettings, SettingsProvider } from '@/lib/settings-context';
import { SessionManager } from '@/lib/session';

function SettingsContent() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();



  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-2xl"
          >
            ×
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-8">
          {/* Notifications Section */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-4 bg-card border border-border rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => updateSettings({ notifications: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts for new messages</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Sound Effects</p>
                  <p className="text-xs text-muted-foreground">Play sounds for incoming messages</p>
                </div>
              </label>
            </div>
          </section>

          {/* Privacy Section */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Privacy & Visibility</h2>
            <div className="space-y-4 bg-card border border-border rounded-lg p-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => updateSettings({ status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Direct Messages From</label>
                <select
                  value={settings.privateMessages}
                  onChange={(e) => updateSettings({ privateMessages: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Anyone</option>
                  <option value="friends">Known users only</option>
                  <option value="none">Nobody</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lastActivityVisible}
                  onChange={(e) => updateSettings({ lastActivityVisible: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Show Last Activity</p>
                  <p className="text-xs text-muted-foreground">Display when you were last seen</p>
                </div>
              </label>
            </div>
          </section>

          {/* Message Settings */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Messages</h2>
            <div className="space-y-4 bg-card border border-border rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.readReceipts}
                  onChange={(e) => updateSettings({ readReceipts: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Read Receipts</p>
                  <p className="text-xs text-muted-foreground">Let others see when you read messages</p>
                </div>
              </label>
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Account</h2>
            <div className="space-y-3 bg-card border border-border rounded-lg p-4">
              <button
                onClick={resetSettings}
                className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition"
              >
                Reset All Settings to Default
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition"
              >
                Logout
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
}
