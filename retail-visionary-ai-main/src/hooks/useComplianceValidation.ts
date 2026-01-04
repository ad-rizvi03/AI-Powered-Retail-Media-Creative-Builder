import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCreativeStore } from '@/stores/creativeStore';
import { toast } from 'sonner';
import type { ComplianceCheck } from '@/types/creative';

export function useComplianceValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const { 
    currentCreative, 
    selectedPlatform, 
    brandAssets,
    setComplianceChecks 
  } = useCreativeStore();

  const validateCompliance = async () => {
    if (!currentCreative) {
      toast.error('No creative to validate');
      return;
    }

    setIsValidating(true);
    
    try {
      const creativeData = {
        elements: currentCreative.elements || [],
        backgroundColor: currentCreative.backgroundColor || '#ffffff',
        platform: {
          width: selectedPlatform.width,
          height: selectedPlatform.height,
          name: selectedPlatform.name,
        },
        brandColors: brandAssets.colors,
      };

      const { data, error } = await supabase.functions.invoke('validate-compliance', {
        body: { creativeData },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add funds to continue.');
        } else {
          toast.error('Validation failed: ' + error.message);
        }
        return;
      }

      const checks = data?.checks as ComplianceCheck[];
      if (checks && Array.isArray(checks)) {
        setComplianceChecks(checks);
        toast.success('Compliance validation complete');
      }
    } catch (error) {
      console.error('Compliance validation error:', error);
      toast.error('Failed to validate compliance');
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateCompliance,
    isValidating,
  };
}
