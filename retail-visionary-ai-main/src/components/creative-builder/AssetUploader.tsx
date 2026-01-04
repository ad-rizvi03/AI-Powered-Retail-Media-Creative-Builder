import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  Type, 
  X, 
  Sparkles,
  Package,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreativeStore } from '@/stores/creativeStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AssetUploader() {
  const { 
    brandAssets, 
    setBrandAssets, 
    productAssets, 
    addProductAsset, 
    removeProductAsset,
    setCurrentStep,
    completeStep
  } = useCreativeStore();

  const onDropProduct = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        addProductAsset({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          image: reader.result as string,
        });
        toast.success(`Product image "${file.name}" uploaded`);
      };
      reader.readAsDataURL(file);
    });
  }, [addProductAsset]);

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBrandAssets({ logo: reader.result as string });
        toast.success('Brand logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  }, [setBrandAssets]);

  const { getRootProps: getProductRootProps, getInputProps: getProductInputProps, isDragActive: isProductDragActive } = useDropzone({
    onDrop: onDropProduct,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxFiles: 1,
  });

  const handleContinue = () => {
    if (productAssets.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    completeStep(1);
    setCurrentStep(2);
  };

  const colorPresets = [
    { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
    { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#f59e0b' },
    { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#8b5cf6' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#d97706', accent: '#3b82f6' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Product Images Section */}
        <section className="animate-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Product Images</h2>
              <p className="text-sm text-muted-foreground">Upload your product photos for the creative</p>
            </div>
          </div>

          <div
            {...getProductRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isProductDragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input {...getProductInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <motion.div 
                animate={{ y: isProductDragActive ? -5 : 0 }}
                className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center"
              >
                <Upload className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <div>
                <p className="text-foreground font-medium">
                  {isProductDragActive ? 'Drop your images here' : 'Drag & drop product images'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • PNG, JPG, WEBP
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Products Grid */}
          <AnimatePresence mode="popLayout">
            {productAssets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4"
              >
                {productAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted"
                  >
                    <img 
                      src={asset.image} 
                      alt={asset.name}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProductAsset(asset.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/80 to-transparent">
                      <p className="text-xs text-background truncate">{asset.name}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Brand Assets Section */}
        <section className="animate-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Brand Assets</h2>
              <p className="text-sm text-muted-foreground">Add your logo and brand colors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div
              {...getLogoRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
                isLogoDragActive 
                  ? "border-accent bg-accent/5" 
                  : "border-border hover:border-accent/50"
              )}
            >
              <input {...getLogoInputProps()} />
              {brandAssets.logo ? (
                <div className="relative">
                  <img 
                    src={brandAssets.logo} 
                    alt="Brand logo" 
                    className="max-h-24 mx-auto object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    className="absolute -top-2 -right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrandAssets({ logo: null });
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload brand logo</p>
                </div>
              )}
            </div>

            {/* Brand Colors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Brand Colors</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => {
                    // Extract colors from logo would go here
                    toast.info('AI color extraction coming soon!');
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Auto-extract
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBrandAssets({ 
                      colors: { 
                        primary: preset.primary, 
                        secondary: preset.secondary, 
                        accent: preset.accent 
                      } 
                    })}
                    className={cn(
                      "relative h-12 rounded-lg overflow-hidden border-2 transition-all",
                      brandAssets.colors.primary === preset.primary
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="absolute inset-0 flex">
                      <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                      <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                      <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                {Object.entries(brandAssets.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md border border-border"
                      style={{ backgroundColor: value as string }}
                    />
                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Continue Button */}
        <div className="flex justify-end pt-4">
          <Button 
            variant="glow" 
            size="lg"
            onClick={handleContinue}
            disabled={productAssets.length === 0}
          >
            Continue to Customize
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
