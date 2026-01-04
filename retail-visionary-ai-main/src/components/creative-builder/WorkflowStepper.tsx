import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, LogOut, Sparkles } from 'lucide-react';
import { useCreativeStore } from '@/stores/creativeStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProjectManager } from './ProjectManager';

export function WorkflowStepper() {
  const { workflowSteps, currentStep, setCurrentStep } = useCreativeStore();
  const { user, signOut } = useAuth();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-card border-b border-border">
      {/* Logo & Project Manager */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">AdCraft AI</span>
        </div>
        
        <div className="hidden sm:block h-6 w-px bg-border" />
        
        <ProjectManager 
          currentProjectId={currentProjectId} 
          onProjectChange={setCurrentProjectId} 
        />
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => step.completed || step.active ? setCurrentStep(step.id) : null}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
                step.active && "bg-primary/10",
                step.completed && "cursor-pointer hover:bg-muted",
                !step.active && !step.completed && "opacity-50 cursor-not-allowed"
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: step.active ? 1.1 : 1,
                  backgroundColor: step.completed 
                    ? 'hsl(var(--success))' 
                    : step.active 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--muted))',
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  step.completed || step.active ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </motion.div>
              <div className="text-left hidden md:block">
                <p className={cn(
                  "text-sm font-medium",
                  step.active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </button>
            
            {index < workflowSteps.length - 1 && (
              <div 
                className={cn(
                  "w-12 h-0.5 mx-2 hidden sm:block",
                  step.completed ? "bg-success" : "bg-border"
                )} 
              />
            )}
          </div>
        ))}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium leading-none truncate max-w-[160px]">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
