import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Clock, 
  Loader2,
  Save,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects, type Project } from '@/hooks/useProjects';
import { useCreativeStore } from '@/stores/creativeStore';
import { WORKFLOW_STEPS, PLATFORMS, DEFAULT_COMPLIANCE_CHECKS } from '@/types/creative';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ProjectManagerProps {
  currentProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function ProjectManager({ currentProjectId, onProjectChange }: ProjectManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const store = useCreativeStore();
  
  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleCreateProject = async () => {
    const result = await createProject.mutateAsync(newProjectName || 'Untitled Project');
    setNewProjectName('');
    setIsCreateDialogOpen(false);
    onProjectChange(result.id);
    
    // Reset store to defaults
    store.setCurrentStep(1);
    store.setBrandAssets({
      logo: null,
      secondaryLogo: null,
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
      fonts: { heading: 'Geist Sans', body: 'Geist Sans' },
    });
  };

  const handleLoadProject = (project: Project) => {
    onProjectChange(project.id);
    
    // Load project state into store
    if (project.brand_assets) {
      store.setBrandAssets(project.brand_assets);
    }
    if (project.selected_platform) {
      store.setSelectedPlatform(project.selected_platform);
    }
    if (project.current_creative) {
      store.setCurrentCreative(project.current_creative);
    }
    if (project.campaign_goal) {
      store.setCampaignGoal(project.campaign_goal);
    }
    if (project.current_step) {
      store.setCurrentStep(project.current_step);
    }
    if (project.compliance_checks?.length > 0) {
      store.setComplianceChecks(project.compliance_checks);
    }
    
    toast.success(`Loaded project: ${project.name}`);
  };

  const handleSaveProject = async () => {
    if (!currentProjectId) {
      // Create new project if none selected
      const result = await createProject.mutateAsync('New Project');
      onProjectChange(result.id);
      await saveCurrentState(result.id);
    } else {
      await saveCurrentState(currentProjectId);
    }
  };

  const saveCurrentState = async (projectId: string) => {
    await updateProject.mutateAsync({
      id: projectId,
      updates: {
        brand_assets: store.brandAssets,
        product_assets: store.productAssets,
        selected_platform: store.selectedPlatform,
        current_creative: store.currentCreative,
        campaign_goal: store.campaignGoal,
        current_step: store.currentStep,
        workflow_steps: store.workflowSteps,
        compliance_checks: store.complianceChecks,
      },
    });
    toast.success('Project saved');
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    
    await deleteProject.mutateAsync(deleteProjectId);
    if (currentProjectId === deleteProjectId) {
      onProjectChange(null);
      // Reset store
      store.setCurrentStep(1);
    }
    setDeleteProjectId(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              {currentProject?.name || 'No Project'}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No projects yet
              </div>
            ) : (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  className="flex items-center justify-between group"
                  onClick={() => handleLoadProject(project)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteProjectId(project.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSaveProject}
          disabled={updateProject.isPending || createProject.isPending}
        >
          {(updateProject.isPending || createProject.isPending) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Give your project a name to help you find it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
