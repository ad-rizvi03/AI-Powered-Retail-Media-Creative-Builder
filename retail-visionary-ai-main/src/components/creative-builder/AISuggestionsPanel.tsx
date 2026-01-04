import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Layout, 
  Type, 
  Palette, 
  Target,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreativeStore } from '@/stores/creativeStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock AI suggestions for demo
const mockSuggestions = [
  {
    id: '1',
    type: 'layout' as const,
    title: 'Centered Product Focus',
    description: 'Place product in center with balanced text above and CTA below',
    confidence: 92,
  },
  {
    id: '2',
    type: 'copy' as const,
    title: 'Urgency-driven headline',
    description: '"Limited Time Offer - Shop Now & Save 30%"',
    confidence: 88,
  },
  {
    id: '3',
    type: 'color' as const,
    title: 'High contrast CTA',
    description: 'Use accent color for CTA button to increase visibility',
    confidence: 95,
  },
  {
    id: '4',
    type: 'placement' as const,
    title: 'Logo in safe zone',
    description: 'Move logo to top-left corner for better visibility',
    confidence: 85,
  },
];

const typeIcons = {
  layout: Layout,
  copy: Type,
  color: Palette,
  placement: Target,
};

const typeColors = {
  layout: 'text-blue-500 bg-blue-500/10',
  copy: 'text-green-500 bg-green-500/10',
  color: 'text-purple-500 bg-purple-500/10',
  placement: 'text-orange-500 bg-orange-500/10',
};

export function AISuggestionsPanel() {
  const { isAiProcessing, setIsAiProcessing, aiSuggestions, setAiSuggestions } = useCreativeStore();

  const handleGenerateSuggestions = async () => {
    setIsAiProcessing(true);
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setAiSuggestions(mockSuggestions);
    setIsAiProcessing(false);
    toast.success('AI suggestions generated!');
  };

  const handleApplySuggestion = (suggestionId: string) => {
    toast.success('Suggestion applied to canvas');
    // In real implementation, this would modify the canvas
  };

  const suggestions = aiSuggestions.length > 0 ? aiSuggestions : mockSuggestions;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Suggestions
        </h3>
      </div>

      <Button
        variant="sidebar"
        size="sm"
        className="w-full"
        onClick={handleGenerateSuggestions}
        disabled={isAiProcessing}
      >
        {isAiProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Suggestions
          </>
        )}
      </Button>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const Icon = typeIcons[suggestion.type];
          const colorClass = typeColors[suggestion.type];
          
          return (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleApplySuggestion(suggestion.id)}
              className="w-full text-left p-3 rounded-lg bg-sidebar-muted/50 hover:bg-sidebar-muted transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {suggestion.title}
                    </p>
                    <span className="text-2xs text-sidebar-muted-foreground">
                      {suggestion.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-sidebar-muted-foreground mt-0.5 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-sidebar-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-sidebar-border">
        <p className="text-2xs text-sidebar-muted-foreground text-center">
          AI suggestions are based on best practices and your brand guidelines
        </p>
      </div>
    </div>
  );
}
