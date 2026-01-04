import { WorkflowStepper } from './WorkflowStepper';
import { EditorSidebar } from './EditorSidebar';
import { AssetUploader } from './AssetUploader';
import { CanvasEditor } from './CanvasEditor';
import { CompliancePanel } from './CompliancePanel';
import { ExportPanel } from './ExportPanel';
import { useCreativeStore } from '@/stores/creativeStore';

export function CreativeBuilder() {
  const { currentStep } = useCreativeStore();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AssetUploader />;
      case 2:
        return <CanvasEditor />;
      case 3:
        return <CompliancePanel />;
      case 4:
        return <ExportPanel />;
      default:
        return <AssetUploader />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Only visible in customize step */}
      {currentStep === 2 && <EditorSidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <WorkflowStepper />
        {renderStepContent()}
      </div>
    </div>
  );
}
