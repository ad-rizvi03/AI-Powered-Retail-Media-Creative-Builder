import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wand2,
  Shield,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreativeStore } from '@/stores/creativeStore';
import { useComplianceValidation } from '@/hooks/useComplianceValidation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusIcons = {
  passed: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const statusColors = {
  passed: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
};

const statusBgColors = {
  passed: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-destructive/10',
};

export function CompliancePanel() {
  const { 
    setCurrentStep, 
    completeStep, 
    complianceChecks, 
    fixComplianceCheck, 
    fixAllComplianceChecks 
  } = useCreativeStore();
  
  const { validateCompliance, isValidating } = useComplianceValidation();

  const passedCount = complianceChecks.filter((c) => c.status === 'passed').length;
  const warningCount = complianceChecks.filter((c) => c.status === 'warning').length;
  const errorCount = complianceChecks.filter((c) => c.status === 'error').length;
  
  const overallScore = Math.round((passedCount / complianceChecks.length) * 100);

  const handleAutoFix = (checkId: string) => {
    fixComplianceCheck(checkId);
    toast.success('Issue automatically fixed!');
  };

  const handleAutoFixAll = () => {
    fixAllComplianceChecks();
    toast.success('All auto-fixable issues resolved!');
  };

  const handleContinueToExport = () => {
    if (errorCount > 0) {
      toast.error('Please fix all errors before exporting');
      return;
    }
    completeStep(3);
    setCurrentStep(4);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  initial={{ strokeDasharray: '0 226' }}
                  animate={{ strokeDasharray: `${overallScore * 2.26} 226` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    overallScore >= 80 ? 'text-success' :
                    overallScore >= 60 ? 'text-warning' : 'text-destructive'
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  key={overallScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold"
                >
                  {overallScore}
                </motion.span>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Compliance Score
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {overallScore === 100 
                  ? 'Your creative passes all compliance checks!'
                  : 'Your creative meets most compliance requirements'
                }
              </p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm">{passedCount} passed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm">{warningCount} warnings</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm">{errorCount} errors</span>
                  </div>
                )}
              </div>
            </div>

            {(warningCount > 0 || errorCount > 0) && (
              <Button
                variant="warning"
                size="sm"
                onClick={handleAutoFixAll}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-fix all
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={validateCompliance}
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Analyze
            </Button>
          </div>
        </motion.div>

        {/* Checks List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Validation Checks</h3>
          
          {complianceChecks.map((check, index) => {
            const Icon = statusIcons[check.status];
            
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  statusBgColors[check.status],
                  check.status === 'passed' ? 'border-success/20' :
                  check.status === 'warning' ? 'border-warning/20' : 'border-destructive/20'
                )}
              >
                <motion.div 
                  layout
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    statusBgColors[check.status]
                  )}
                >
                  <Icon className={cn("w-5 h-5", statusColors[check.status])} />
                </motion.div>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>

                {check.autoFixAvailable && check.status !== 'passed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoFix(check.id)}
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" />
                    Fix
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-end pt-4">
          <Button
            variant="glow"
            size="lg"
            onClick={handleContinueToExport}
          >
            Continue to Export
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}