import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect, IText, Circle } from 'fabric';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MousePointer2, 
  Type, 
  Square, 
  Circle as CircleIcon,
  Image as ImageIcon,
  Trash2,
  Copy,
  Undo,
  Redo,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreativeStore } from '@/stores/creativeStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ToolType = 'select' | 'text' | 'rectangle' | 'circle';

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  
  const { 
    selectedPlatform, 
    productAssets, 
    brandAssets,
    zoom,
    setZoom,
    setCurrentStep,
    completeStep,
    setFabricCanvas: setStoreFabricCanvas
  } = useCreativeStore();

  const handleContinueToValidate = () => {
    completeStep(2);
    setCurrentStep(3);
  };

  // Calculate canvas dimensions to fit container while maintaining aspect ratio
  const getScaledDimensions = () => {
    const maxWidth = 600;
    const maxHeight = 500;
    const { width, height } = selectedPlatform;
    
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    return {
      width: width * scale,
      height: height * scale,
      scale,
    };
  };

  const { width: canvasWidth, height: canvasHeight, scale } = getScaledDimensions();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      selection: true,
    });

    // Add grid pattern for design reference (optional visual)
    canvas.renderAll();
    setFabricCanvas(canvas);
    setStoreFabricCanvas(canvas);

    return () => {
      setStoreFabricCanvas(null);
      canvas.dispose();
    };
  }, [selectedPlatform, setStoreFabricCanvas]);

  // Add product image to canvas
  useEffect(() => {
    if (!fabricCanvas || productAssets.length === 0) return;

    // Add first product to canvas if empty
    if (fabricCanvas.getObjects().length === 0 && productAssets[0]) {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';
      imgElement.src = productAssets[0].image;
      imgElement.onload = () => {
        const fabricImg = new FabricImage(imgElement, {
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: Math.min(canvasWidth * 0.6 / imgElement.width, 1),
          scaleY: Math.min(canvasHeight * 0.6 / imgElement.height, 1),
        });
        fabricCanvas.add(fabricImg);
        fabricCanvas.renderAll();
      };
    }
  }, [fabricCanvas, productAssets, canvasWidth, canvasHeight]);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    
    if (!fabricCanvas) return;

    if (tool === 'select') {
      fabricCanvas.isDrawingMode = false;
      return;
    }

    if (tool === 'text') {
      const text = new IText('Click to edit', {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 24 * scale,
        fill: brandAssets.colors.primary,
        fontFamily: 'Geist Sans',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      fabricCanvas.renderAll();
      setActiveTool('select');
    }

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        width: 100,
        height: 80,
        fill: brandAssets.colors.primary,
        rx: 8,
        ry: 8,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      fabricCanvas.renderAll();
      setActiveTool('select');
    }

    if (tool === 'circle') {
      const circle = new Circle({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        radius: 50,
        fill: brandAssets.colors.accent,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      fabricCanvas.renderAll();
      setActiveTool('select');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 0.1, 2) 
      : Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    
    if (fabricCanvas) {
      fabricCanvas.setZoom(newZoom);
      fabricCanvas.renderAll();
    }
  };

  const handleDelete = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      toast.success('Element deleted');
    }
  };

  const handleDuplicate = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      activeObject.clone().then((cloned: any) => {
        cloned.set({
          left: (activeObject.left || 0) + 20,
          top: (activeObject.top || 0) + 20,
        });
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.renderAll();
        toast.success('Element duplicated');
      });
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: CircleIcon, label: 'Circle' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-canvas overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'tool-active' : 'tool'}
              size="icon-sm"
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="tool"
            size="icon-sm"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="tool"
            size="icon-sm"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleZoom('out')}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleZoom('in')}
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom(1)}
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="glow" 
          onClick={handleContinueToValidate}
        >
          Continue to Validate
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-8 canvas-grid overflow-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative shadow-lg rounded-lg overflow-hidden"
          style={{ transform: `scale(${zoom})` }}
        >
          <canvas ref={canvasRef} className="block" />
          
          {/* Platform label */}
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">
              {selectedPlatform.name} • {selectedPlatform.width}×{selectedPlatform.height}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
