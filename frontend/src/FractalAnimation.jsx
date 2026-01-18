
import { useEffect, useRef } from 'react';

const FractalAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      const parent = canvas.parentElement;
      // Lower res for performance on pixel shader tasks
      const dpr = 1; // Keep it 1:1 for performance in fractal math
      
      canvas.style.width = `${parent.offsetWidth}px`;
      canvas.style.height = `${parent.offsetHeight}px`;

      canvas.width = parent.offsetWidth * dpr;
      canvas.height = parent.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    // Fractal Parameters
    let zoomCenterReal = -0.743643887037158704752191506114774;
    let zoomCenterImag = 0.131825904205311970493132056385139;
    let zoomFactor = 1.0;
    
    // Color palette
    const maxIterations = 60;
    const colors = new Array(maxIterations).fill(0).map((_, i) => {
        const t = i / maxIterations;
        const r = Math.floor(9 * (1 - t) * t * t * 255);
        const g = Math.floor(15 * (1 - t) * (1 - t) * t * 255);
        const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * 255);
        return `rgb(${r*2},${g*4},${b*8})`; // Boosted colors for "neon" look
    });

    // Render loop
    const renderMandelbrot = (width, height) => {
        // Fast rendering: pixel manipulation
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        // Scale to keep aspect ratio
        const ratio = width / height;
        const scale = 3.0 / zoomFactor; 
        const minReal = zoomCenterReal - scale * ratio / 2;
        const minImag = zoomCenterImag - scale / 2;
        
        // Skip pixels for performance (render every 2nd pixel)
        // Or render full res but optimize math
        
        for (let y = 0; y < height; y++) {
            const imag = minImag + (y / height) * scale;
            for (let x = 0; x < width; x++) {
                const real = minReal + (x / width) * scale * ratio;
                
                let zReal = real;
                let zImag = imag;
                let n = 0;
                
                // Optimized loop
                for (; n < maxIterations; n++) {
                    const r2 = zReal * zReal;
                    const i2 = zImag * zImag;
                    if (r2 + i2 > 4.0) break;
                    
                    zImag = 2.0 * zReal * zImag + imag;
                    zReal = r2 - i2 + real;
                }
                
                const pixIndex = (y * width + x) * 4;
                if (n === maxIterations) {
                    data[pixIndex] = 15;     // R
                    data[pixIndex + 1] = 23; // G
                    data[pixIndex + 2] = 42; // B
                    data[pixIndex + 3] = 255;
                } else {
                    // Map interactions to color
                    // Use simple cyclic coloring
                    const col = n % 16;
                    // Cyberpunk palette mapping
                    const val = n * 4;
                    data[pixIndex] = (n * 16) % 255;     // R
                    data[pixIndex + 1] = (n * 32) % 255; // G
                    data[pixIndex + 2] = (n * 64) % 255; // B
                    data[pixIndex + 3] = 255;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    let start = Date.now();

    const animate = () => {
        const width = canvas.width;
        const height = canvas.height;
        
        // Dynamic Zoom
        const now = Date.now();
        const t = (now - start) / 1000;
        zoomFactor = Math.pow(1.5, t % 20); // Reset every 20s equivalent

        // Reset if zoom gets too deep (loss of float precision) or cyclic
        if (t > 20) {
           start = Date.now();
        }

        renderMandelbrot(width, height);
        
        animationRef.current = requestAnimationFrame(animate);
    };

    // Initial render
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-slate-200">Fractal Zoom</h2>
        <p className="text-sm text-slate-500">Mandelbrot Set</p>
      </div>
      <canvas ref={canvasRef} className="block" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default FractalAnimation;
