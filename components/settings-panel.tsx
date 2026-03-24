'use client';

import { useSettings } from '@/lib/settings-context';
import { useState } from 'react';

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-96 overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Notifications */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Enable Notifications</span>
            </label>
            <p className="text-xs text-muted-foreground ml-7">Receive alerts for new messages</p>
          </div>

          {/* Sound */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Sound Effects</span>
            </label>
            <p className="text-xs text-muted-foreground ml-7">Play sounds for messages</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Status</label>
            <select
              value={settings.status}
              onChange={(e) => updateSettings({ status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Private Messages */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Private Messages</label>
            <select
              value={settings.privateMessages}
              onChange={(e) => updateSettings({ privateMessages: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">From anyone</option>
              <option value="friends">From known users only</option>
              <option value="none">Disabled</option>
            </select>
          </div>

          {/* Read Receipts */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.readReceipts}
                onChange={(e) => updateSettings({ readReceipts: e.target.checked })}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Show Read Receipts</span>
            </label>
            <p className="text-xs text-muted-foreground ml-7">Let others see when you read messages</p>
          </div>

          {/* Last Activity */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lastActivityVisible}
                onChange={(e) => updateSettings({ lastActivityVisible: e.target.checked })}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Show Last Activity</span>
            </label>
            <p className="text-xs text-muted-foreground ml-7">Display when you were last seen</p>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition border border-border rounded-lg hover:border-destructive"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-muted"
        title="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-96 overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Notifications */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => updateSettings({ notifications: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Enable Notifications</span>
                </label>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Status</label>
                <select
                  value={settings.status}
                  onChange={(e) => updateSettings({ status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Sound */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Sound Effects</span>
                </label>
              </div>

              {/* Read Receipts */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.readReceipts}
                    onChange={(e) => updateSettings({ readReceipts: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Show Read Receipts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
