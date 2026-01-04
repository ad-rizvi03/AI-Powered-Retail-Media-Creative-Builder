import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Settings,
  HelpCircle,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { PlatformSelector } from './PlatformSelector';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { useCreativeStore } from '@/stores/creativeStore';
import { cn } from '@/lib/utils';

type Tab = 'platforms' | 'ai' | 'assets';

export function EditorSidebar() {
  const { productAssets, brandAssets } = useCreativeStore();
  const [activeTab, setActiveTab] = useState<Tab>('platforms');

  const tabs = [
    { id: 'platforms' as const, icon: Layers, label: 'Platforms' },
    { id: 'ai' as const, icon: Sparkles, label: 'AI' },
    { id: 'assets' as const, icon: ImageIcon, label: 'Assets' },
  ];

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">AdCraft AI</h1>
            <p className="text-xs text-sidebar-muted-foreground">Creative Builder</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-sidebar-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-sidebar-accent-foreground"
                : "text-sidebar-muted-foreground hover:text-sidebar-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sidebar-accent"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'platforms' && <PlatformSelector />}
        {activeTab === 'ai' && <AISuggestionsPanel />}
        {activeTab === 'assets' && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-sidebar-foreground">Assets</h3>
            <div className="grid grid-cols-2 gap-2">
              {productAssets.map((asset) => (
                <div key={asset.id} className="aspect-square rounded-lg overflow-hidden bg-sidebar-muted border border-sidebar-border">
                  <img src={asset.image} alt={asset.name} className="w-full h-full object-contain p-1" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {Object.values(brandAssets.colors).map((color, i) => (
                <div key={i} className="w-8 h-8 rounded-lg border border-sidebar-border" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border flex justify-between">
        <button className="p-2 rounded-lg text-sidebar-muted-foreground hover:bg-sidebar-muted">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-sidebar-muted-foreground hover:bg-sidebar-muted">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
