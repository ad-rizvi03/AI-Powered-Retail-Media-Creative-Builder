import { create } from 'zustand';
import type { Canvas as FabricCanvas } from 'fabric';
import { 
  BrandAssets, 
  ProductAsset, 
  Creative, 
  Platform, 
  WorkflowStep, 
  AISuggestion,
  ComplianceCheck,
  WORKFLOW_STEPS,
  PLATFORMS,
  DEFAULT_COMPLIANCE_CHECKS
} from '@/types/creative';

interface CreativeStore {
  // Workflow
  currentStep: number;
  workflowSteps: WorkflowStep[];
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: number) => void;
  
  // Brand assets
  brandAssets: BrandAssets;
  setBrandAssets: (assets: Partial<BrandAssets>) => void;
  
  // Product assets
  productAssets: ProductAsset[];
  addProductAsset: (asset: ProductAsset) => void;
  removeProductAsset: (id: string) => void;
  
  // Canvas
  selectedPlatform: Platform;
  setSelectedPlatform: (platform: Platform) => void;
  currentCreative: Creative | null;
  setCurrentCreative: (creative: Creative) => void;
  
  // AI
  aiSuggestions: AISuggestion[];
  setAiSuggestions: (suggestions: AISuggestion[]) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (processing: boolean) => void;
  
  // Campaign
  campaignGoal: string | null;
  setCampaignGoal: (goal: string) => void;
  
  // Canvas state
  zoom: number;
  setZoom: (zoom: number) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  
  // Fabric canvas reference for export
  fabricCanvas: FabricCanvas | null;
  setFabricCanvas: (canvas: FabricCanvas | null) => void;
  
  // Compliance
  complianceChecks: ComplianceCheck[];
  setComplianceChecks: (checks: ComplianceCheck[]) => void;
  fixComplianceCheck: (checkId: string) => void;
  fixAllComplianceChecks: () => void;
}

export const useCreativeStore = create<CreativeStore>((set) => ({
  // Workflow
  currentStep: 1,
  workflowSteps: WORKFLOW_STEPS,
  setCurrentStep: (step) => set((state) => ({
    currentStep: step,
    workflowSteps: state.workflowSteps.map((s) => ({
      ...s,
      active: s.id === step,
    })),
  })),
  completeStep: (stepId) => set((state) => ({
    workflowSteps: state.workflowSteps.map((s) => 
      s.id === stepId ? { ...s, completed: true } : s
    ),
  })),
  
  // Brand assets
  brandAssets: {
    logo: null,
    secondaryLogo: null,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
    },
    fonts: {
      heading: 'Geist Sans',
      body: 'Geist Sans',
    },
  },
  setBrandAssets: (assets) => set((state) => ({
    brandAssets: { ...state.brandAssets, ...assets },
  })),
  
  // Product assets
  productAssets: [],
  addProductAsset: (asset) => set((state) => ({
    productAssets: [...state.productAssets, asset],
  })),
  removeProductAsset: (id) => set((state) => ({
    productAssets: state.productAssets.filter((a) => a.id !== id),
  })),
  
  // Canvas
  selectedPlatform: PLATFORMS[0],
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  currentCreative: null,
  setCurrentCreative: (creative) => set({ currentCreative: creative }),
  
  // AI
  aiSuggestions: [],
  setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  isAiProcessing: false,
  setIsAiProcessing: (processing) => set({ isAiProcessing: processing }),
  
  // Campaign
  campaignGoal: null,
  setCampaignGoal: (goal) => set({ campaignGoal: goal }),
  
  // Canvas state
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
  // Fabric canvas reference
  fabricCanvas: null,
  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  
  // Compliance
  complianceChecks: DEFAULT_COMPLIANCE_CHECKS,
  setComplianceChecks: (checks) => set({ complianceChecks: checks }),
  fixComplianceCheck: (checkId) => set((state) => ({
    complianceChecks: state.complianceChecks.map((check) =>
      check.id === checkId && check.autoFixAvailable
        ? { ...check, status: 'passed', message: `${check.name} - Fixed automatically` }
        : check
    ),
  })),
  fixAllComplianceChecks: () => set((state) => ({
    complianceChecks: state.complianceChecks.map((check) =>
      check.autoFixAvailable && check.status !== 'passed'
        ? { ...check, status: 'passed', message: `${check.name} - Fixed automatically` }
        : check
    ),
  })),
}));
