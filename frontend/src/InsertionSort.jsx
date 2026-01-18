import { useEffect, useRef } from 'react';

const InsertionSort = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const arrayRef = useRef(null);
  const sortStepsRef = useRef([]);
  const currentStepRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size with High DPI support
    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width = `${parent.offsetWidth}px`;
      canvas.style.height = `${parent.offsetHeight}px`;

      canvas.width = parent.offsetWidth * dpr;
      canvas.height = parent.offsetHeight * dpr;

      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate random array with 30 elements
    const generateArray = () => {
      const size = 30;
      return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    };

    // Generate all insertion sort steps - simplified, only major operations
    const generateSortSteps = (arr) => {
      const steps = [];
      const temp = [...arr];
      const n = temp.length;

      for (let i = 1; i < n; i++) {
        let j = i - 1;
        const key = temp[i];

        while (j >= 0 && temp[j] > key) {
          // Only record the swap action
          temp[j + 1] = temp[j];
          steps.push({
            type: 'swap',
            array: [...temp],
            activeIndex: j,
            sorted: Array.from({ length: i }, (_, k) => k),
          });
          j--;
        }

        temp[j + 1] = key;
      }

      return steps;
    };

    // Initialize
    if (!arrayRef.current) {
      arrayRef.current = generateArray();
      sortStepsRef.current = generateSortSteps(arrayRef.current);
      currentStepRef.current = 0;
    }

    const animate = () => {
      const width = canvas.parentElement.offsetWidth;
      const height = canvas.parentElement.offsetHeight;

      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const steps = sortStepsRef.current;
      if (steps.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Progress through steps - much faster animation
      if (currentStepRef.current < steps.length - 1) {
        currentStepRef.current += 3;
      }

      const step = steps[currentStepRef.current];
      if (!step) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { array, activeIndex, sorted } = step;

      // Draw bars - clean and simple
      const padding = 40;
      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;

      const barWidth = availableWidth / array.length;
      const maxValue = 100;
      const barMaxHeight = availableHeight * 0.85;

      const startX = padding;
      const bottomY = height - padding;

      // Draw each bar
      array.forEach((num, index) => {
        const x = startX + index * barWidth;
        const barHeight = (num / maxValue) * barMaxHeight;
        const y = bottomY - barHeight;

        // Determine color - Sound of Sorting style
        let barColor = '#6366f1'; // Indigo for default
        
        if (sorted && sorted.includes(index)) {
          barColor = '#10b981'; // Green for sorted
        } else if (index === activeIndex) {
          barColor = '#ef4444'; // Red for active swap
        }

        // Draw bar - no glow, clean lines
        ctx.fillStyle = barColor;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-slate-200">Insertion Sort Visualization</h2>
      </div>
      <canvas ref={canvasRef} className="block" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default InsertionSort;