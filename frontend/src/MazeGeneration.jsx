
import { useEffect, useRef } from 'react';

const MazeGeneration = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
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

    // Maze Configuration
    const CELL_SIZE = 15;
    const WALL_COLOR = '#1e293b'; // slate-800
    const PATH_COLOR = '#06b6d4'; // cyan-500
    const HEAD_COLOR = '#ec4899'; // pink-500
    
    let cols, rows;
    let grid = [];
    let stack = [];
    let current;
    
    class Cell {
      constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true]; // top, right, bottom, left
        this.visited = false;
      }

      checkNeighbors() {
        let neighbors = [];
        const top = grid[this.index(this.i, this.j - 1)];
        const right = grid[this.index(this.i + 1, this.j)];
        const bottom = grid[this.index(this.i, this.j + 1)];
        const left = grid[this.index(this.i - 1, this.j)];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
          const r = Math.floor(Math.random() * neighbors.length);
          return neighbors[r];
        } else {
          return undefined;
        }
      }

      index(i, j) {
        if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) return -1;
        return i + j * cols;
      }

      show() {
        const x = this.i * CELL_SIZE;
        const y = this.j * CELL_SIZE;

        // Draw visited cell
        if (this.visited) {
          ctx.fillStyle = '#0f172a'; // slate-950 (background)
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Draw walls
        ctx.strokeStyle = WALL_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.walls[0]) { // Top
          ctx.moveTo(x, y);
          ctx.lineTo(x + CELL_SIZE, y);
        }
        if (this.walls[1]) { // Right
          ctx.moveTo(x + CELL_SIZE, y);
          ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        }
        if (this.walls[2]) { // Bottom
          ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
          ctx.lineTo(x, y + CELL_SIZE);
        }
        if (this.walls[3]) { // Left
          ctx.moveTo(x, y + CELL_SIZE);
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fill with color if visited to highlight path briefly (optional visual style)
        if (this.visited) {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }

      highlight() {
        const x = this.i * CELL_SIZE;
        const y = this.j * CELL_SIZE;
        ctx.fillStyle = HEAD_COLOR;
        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        
        // Add glow
        ctx.shadowColor = HEAD_COLOR;
        ctx.shadowBlur = 10;
        ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
        ctx.shadowBlur = 0;
      }
    }

    const removeWalls = (a, b) => {
      const x = a.i - b.i;
      if (x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
      } else if (x === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
      }
      const y = a.j - b.j;
      if (y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
      } else if (y === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
      }
    };

    const setup = () => {
        const width = canvas.parentElement.offsetWidth;
        const height = canvas.parentElement.offsetHeight;
        
        cols = Math.floor(width / CELL_SIZE);
        rows = Math.floor(height / CELL_SIZE);
        
        grid = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                grid.push(new Cell(i, j));
            }
        }
        
        current = grid[0];
        current.visited = true;
        stack = [];
    };

    setup();

    let finished = false;

    const animate = () => {
        const width = canvas.parentElement.offsetWidth;
        const height = canvas.parentElement.offsetHeight;

        // Draw background only once typically, but we redraw for clean lines
        // For performance, we could optimize this, but for maze gen we need to redraw active area
        // Actually, let's just redraw the whole grid or dirty rects. 
        // Given modern canvas, redrawing whole grid is fine for < 2000 cells.
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < grid.length; i++) {
            grid[i].show();
        }

        // Multiple steps per frame for speed
        for (let n = 0; n < 20; n++) { // SPEED UP
            if (!current) break;

            const next = current.checkNeighbors();
            if (next) {
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                finished = true;
                // Reset immediately for loop
                setup();
                break;
            }
        }

        if (current && !finished) {
            current.highlight();
        }

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
        <h2 className="text-xl font-bold text-slate-200">Maze Generation</h2>
        <p className="text-sm text-slate-500">Recursive Backtracker</p>
      </div>
      <canvas ref={canvasRef} className="block" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MazeGeneration;
