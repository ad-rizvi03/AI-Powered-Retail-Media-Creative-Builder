import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileImage, 
  Archive,
  Check,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreativeStore } from '@/stores/creativeStore';
import { PLATFORMS } from '@/types/creative';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ExportPanel() {
  const { selectedPlatform, fabricCanvas } = useCreativeStore();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['png']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([selectedPlatform.id]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const formats = [
    { id: 'png', name: 'PNG', description: 'Best quality, larger file size', mimeType: 'image/png' },
    { id: 'jpg', name: 'JPG', description: 'Smaller size, good for photos', mimeType: 'image/jpeg' },
  ];

  const toggleFormat = (formatId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((f) => f !== formatId)
        : [...prev, formatId]
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    if (!fabricCanvas) {
      toast.error('Canvas not available. Please go back to the Customize step first.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Export for each selected format and platform combination
      for (const formatId of selectedFormats) {
        const format = formats.find(f => f.id === formatId);
        if (!format) continue;

        for (const platformId of selectedPlatforms) {
          const platform = PLATFORMS.find(p => p.id === platformId);
          if (!platform) continue;

          // Generate the data URL from the canvas
          const dataUrl = fabricCanvas.toDataURL({
            format: formatId as 'png' | 'jpeg',
            quality: formatId === 'jpg' ? 0.9 : 1,
            multiplier: platform.width / fabricCanvas.getWidth(), // Scale to actual platform dimensions
          });

          const filename = `${platform.name.replace(/\s+/g, '-').toLowerCase()}-${platform.width}x${platform.height}.${formatId}`;
          
          // Download the file
          downloadFile(dataUrl, filename);
          
          // Small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setExportComplete(true);
      toast.success(`${selectedPlatforms.length * selectedFormats.length} file(s) downloaded successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export files. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalFiles = selectedFormats.length * selectedPlatforms.length;

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Export Creatives</h2>
          <p className="text-muted-foreground mt-2">
            Download your creatives for all selected platforms
          </p>
        </motion.div>

        {/* Format Selection */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Export Format</h3>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => toggleFormat(format.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  selectedFormats.includes(format.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  selectedFormats.includes(format.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{format.name}</p>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
                {selectedFormats.includes(format.id) && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Platform Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Platforms</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlatforms(PLATFORMS.map((p) => p.id))}
            >
              Select all
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  selectedPlatforms.includes(platform.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold",
                  selectedPlatforms.includes(platform.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {platform.aspectRatio.split(':')[0]}:{platform.aspectRatio.split(':')[1]}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{platform.name}</p>
                  <p className="text-2xs text-muted-foreground">
                    {platform.width}×{platform.height}
                  </p>
                </div>
                {selectedPlatforms.includes(platform.id) && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Export Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted/50 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Archive className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Export Summary</p>
              <p className="text-sm text-muted-foreground">
                {totalFiles} file{totalFiles !== 1 ? 's' : ''} will be generated
              </p>
            </div>
          </div>
          
          <Button
            variant="glow"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || totalFiles === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : exportComplete ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Download Ready
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </>
            )}
          </Button>
        </motion.div>

        {exportComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-xl p-6 text-center"
          >
            <Check className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Export Complete!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your creatives are ready to use across all platforms
            </p>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Downloads
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
