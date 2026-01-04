// Types for the Creative Builder application

export interface BrandAssets {
  logo: string | null;
  secondaryLogo: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface ProductAsset {
  id: string;
  name: string;
  image: string;
  category?: string;
}

export interface CreativeElement {
  id: string;
  type: 'image' | 'text' | 'logo' | 'cta' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  style?: Record<string, any>;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'social' | 'display' | 'video';
}

export interface Creative {
  id: string;
  name: string;
  platform: Platform;
  elements: CreativeElement[];
  backgroundColor: string;
  backgroundImage?: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  check: (creative: Creative) => ComplianceResult;
}

export interface ComplianceResult {
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  autoFixAvailable: boolean;
}

export interface ComplianceCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'error';
  message: string;
  autoFixAvailable: boolean;
}

export const DEFAULT_COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: '1',
    name: 'Logo Placement',
    status: 'passed',
    message: 'Logo is correctly positioned in safe zone',
    autoFixAvailable: false,
  },
  {
    id: '2',
    name: 'Text Readability',
    status: 'warning',
    message: 'Text may be too small on mobile devices',
    autoFixAvailable: true,
  },
  {
    id: '3',
    name: 'Color Contrast',
    status: 'passed',
    message: 'All text meets WCAG AA contrast requirements',
    autoFixAvailable: false,
  },
  {
    id: '4',
    name: 'CTA Visibility',
    status: 'warning',
    message: 'CTA button could be more prominent',
    autoFixAvailable: true,
  },
  {
    id: '5',
    name: 'Safe Zone',
    status: 'passed',
    message: 'All elements within platform safe zones',
    autoFixAvailable: false,
  },
];

export interface AISuggestion {
  id: string;
  type: 'layout' | 'copy' | 'color' | 'placement';
  title: string;
  description: string;
  confidence: number;
  preview?: string;
}

export interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

export interface CampaignGoal {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'fb-feed', name: 'Facebook Feed', icon: 'facebook', width: 1200, height: 628, aspectRatio: '1.91:1', category: 'social' },
  { id: 'ig-feed', name: 'Instagram Feed', icon: 'instagram', width: 1080, height: 1080, aspectRatio: '1:1', category: 'social' },
  { id: 'ig-story', name: 'Instagram Story', icon: 'instagram', width: 1080, height: 1920, aspectRatio: '9:16', category: 'video' },
  { id: 'reels', name: 'Reels / Shorts', icon: 'video', width: 1080, height: 1920, aspectRatio: '9:16', category: 'video' },
  { id: 'display-leaderboard', name: 'Display Leaderboard', icon: 'monitor', width: 728, height: 90, aspectRatio: '8:1', category: 'display' },
  { id: 'display-rectangle', name: 'Display Rectangle', icon: 'monitor', width: 300, height: 250, aspectRatio: '6:5', category: 'display' },
];

export const CAMPAIGN_GOALS: CampaignGoal[] = [
  { id: 'sales', name: 'Drive Sales', description: 'Maximize conversions and purchases', icon: 'shopping-cart' },
  { id: 'awareness', name: 'Brand Awareness', description: 'Increase visibility and reach', icon: 'eye' },
  { id: 'traffic', name: 'Website Traffic', description: 'Drive visitors to your site', icon: 'external-link' },
  { id: 'offer', name: 'Promote Offer', description: 'Highlight deals and discounts', icon: 'tag' },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, name: 'Upload', description: 'Add product & brand assets', icon: 'upload', completed: false, active: true },
  { id: 2, name: 'Customize', description: 'Edit and style your creative', icon: 'palette', completed: false, active: false },
  { id: 3, name: 'Validate', description: 'Check compliance & quality', icon: 'check-circle', completed: false, active: false },
  { id: 4, name: 'Export', description: 'Download for all platforms', icon: 'download', completed: false, active: false },
];
