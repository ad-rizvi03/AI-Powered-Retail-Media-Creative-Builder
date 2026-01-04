import { motion } from 'framer-motion';
import { 
  Facebook, 
  Instagram, 
  Monitor, 
  Video,
  Check
} from 'lucide-react';
import { useCreativeStore } from '@/stores/creativeStore';
import { PLATFORMS, Platform } from '@/types/creative';
import { cn } from '@/lib/utils';

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  monitor: Monitor,
  video: Video,
};

export function PlatformSelector() {
  const { selectedPlatform, setSelectedPlatform } = useCreativeStore();

  const groupedPlatforms = {
    social: PLATFORMS.filter((p) => p.category === 'social'),
    video: PLATFORMS.filter((p) => p.category === 'video'),
    display: PLATFORMS.filter((p) => p.category === 'display'),
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-sidebar-foreground">Platforms</h3>
      
      {Object.entries(groupedPlatforms).map(([category, platforms]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs text-sidebar-muted-foreground uppercase tracking-wider">
            {category}
          </p>
          <div className="space-y-1">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform.icon] || Monitor;
              const isSelected = selectedPlatform.id === platform.id;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left",
                    isSelected 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{platform.name}</p>
                    <p className="text-2xs opacity-70">{platform.aspectRatio}</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
