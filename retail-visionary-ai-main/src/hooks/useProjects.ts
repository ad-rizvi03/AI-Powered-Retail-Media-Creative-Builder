import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { BrandAssets, ProductAsset, Platform, Creative, WorkflowStep, ComplianceCheck } from '@/types/creative';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  brand_assets: BrandAssets;
  product_assets: ProductAsset[];
  selected_platform: Platform | null;
  current_creative: Creative | null;
  campaign_goal: string | null;
  workflow_steps: WorkflowStep[];
  current_step: number;
  compliance_checks: ComplianceCheck[];
  created_at: string;
  updated_at: string;
}

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  brand_assets: unknown;
  product_assets: unknown;
  selected_platform: unknown;
  current_creative: unknown;
  campaign_goal: string | null;
  workflow_steps: unknown;
  current_step: number;
  compliance_checks: unknown;
  created_at: string;
  updated_at: string;
}

const parseProject = (row: ProjectRow): Project => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  brand_assets: row.brand_assets as BrandAssets,
  product_assets: row.product_assets as ProductAsset[],
  selected_platform: row.selected_platform as Platform | null,
  current_creative: row.current_creative as Creative | null,
  campaign_goal: row.campaign_goal,
  workflow_steps: row.workflow_steps as WorkflowStep[],
  current_step: row.current_step,
  compliance_checks: row.compliance_checks as ComplianceCheck[],
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(parseProject);
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (name: string = 'Untitled Project') => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;
      return parseProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Failed to create project: ' + error.message);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return parseProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to save project: ' + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project: ' + error.message);
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useProject(projectId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!user?.id || !projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data ? parseProject(data) : null;
    },
    enabled: !!user?.id && !!projectId,
  });
}
