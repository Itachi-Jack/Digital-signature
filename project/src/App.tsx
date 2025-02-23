import React, { useRef, useState, useEffect } from 'react';
import { Download, Eraser, X } from 'lucide-react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (!context) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);

    // Set drawing or erasing mode
    if (isEraser) {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = 20; // Larger width for eraser
    } else {
      context.globalCompositeOperation = 'source-over';
      context.lineWidth = 2;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (!context) return;
    context.closePath();
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const downloadSignature = async () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      // Create a blob from the data URL
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      // Use the showSaveFilePicker API
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'signature.png',
          types: [{
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] }
          }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(file);
        await writable.close();
      } catch (err) {
        // Fallback for browsers that don't support showSaveFilePicker
        const link = document.createElement('a');
        link.download = 'signature.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
    if (context) {
      if (!isEraser) {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 20;
      } else {
        context.globalCompositeOperation = 'source-over';
        context.lineWidth = 2;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Beautiful Digital Signatures</h1>
          <p className="text-lg text-gray-600">
            Create, customize, and download your digital signature with our elegant and easy-to-use signature tool.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              className="w-full h-64 touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
                <span>Clear</span>
              </button>
              <button
                onClick={toggleEraser}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isEraser 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Eraser size={20} />
                <span>Eraser</span>
              </button>
            </div>

            <button
              onClick={downloadSignature}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;