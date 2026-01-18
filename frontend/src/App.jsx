
import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Zap, BarChart3, Wifi, WifiOff, Music, Network, Circle, Snowflake, TrendingUp } from 'lucide-react';
import BinaryTree from './BinaryTree';
import CollisionAnimation from './CollisionAnimation';
import FractalAnimation from './FractalAnimation';
import CollatzAnimation from './CollatzAnimation';

const WEBSOCKET_URL = 'ws://localhost:8766/ws';

// Musical notes for display
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function App() {
  const [cpuHistory, setCpuHistory] = useState(() => Array(100).fill(0));
  const [currentCPU, setCurrentCPU] = useState(0);
  const [peakCPU, setPeakCPU] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('compute');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
<<<<<<< Updated upstream
  const [barPosition, setBarPosition] = useState(0);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'tree', 'collision', 'fractal', or 'collatz'
=======
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'tree'
>>>>>>> Stashed changes

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const noteBarRef = useRef(null);

  // WebSocket connection with auto-reconnect
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Connecting to CPU WebSocket...');
    setConnectionError(null);

    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('Connected to CPU WebSocket');
      setIsConnected(true);
      setConnectionError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle note events from the server
        if (data.event === 'note_start') {
          if (typeof data.index === 'number') {
            setActiveNoteIndex(data.index);
          }
          return;
        }

        const cpuValue = data.cpu;

        // Update CPU directly (no interpolation)
        setCurrentCPU(cpuValue);

        // Update peak
        setPeakCPU(prev => Math.max(prev, cpuValue));

        // Add to history
        setCpuHistory(prev => [...prev.slice(1), cpuValue]);
      } catch (err) {
        console.error('Error parsing CPU data:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Auto-reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          connectWebSocket();
        }
      }, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionError('Failed to connect to CPU server');
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [isPlaying]);

  // Connect/disconnect based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      connectWebSocket();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isPlaying, connectWebSocket]);

  // Note events are now driven by server broadcasts (see ws.onmessage)

  const getCPUColor = (value) => {
    if (value < 30) return 'text-cyan-400';
    if (value < 60) return 'text-purple-400';
    return 'text-pink-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono flex">
      {/* Left Panel - Dashboard */}
      <div className="w-[40%] min-w-[320px] p-4 flex flex-col gap-4 border-r border-slate-800/50">
        {/* Header */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-cyan-400" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                CPU Symphony
              </h1>
              <p className="text-xs text-slate-500">Music from Machines</p>
            </div>

            <div className="ml-auto flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Dashboard"
              >
                <Activity size={16} />
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`p-2 rounded-md transition-all ${viewMode === 'tree' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Binary Tree"
              >
                <Network size={16} />
              </button>
              <button
                onClick={() => setViewMode('collision')}
                className={`p-2 rounded-md transition-all ${viewMode === 'collision' ? 'bg-slate-800 text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Collision Physics"
              >
                <Circle size={16} />
              </button>
              <button
                onClick={() => setViewMode('fractal')}
                className={`p-2 rounded-md transition-all ${viewMode === 'fractal' ? 'bg-slate-800 text-green-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Fractal Flames"
              >
                <Snowflake size={16} />
              </button>
              <button
                onClick={() => setViewMode('collatz')}
                className={`p-2 rounded-md transition-all ${viewMode === 'collatz' ? 'bg-slate-800 text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Collatz Conjecture"
              >
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {viewMode === 'dashboard' ? (
          <>
            <div className={`glass-panel p-3 flex items-center gap-2 ${isConnected ? 'border-green-500/30' : 'border-red-500/30'}`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Connected to CPU Server</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">
                    {connectionError || 'Disconnected - Reconnecting...'}
                  </span>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current CPU</p>
                <p className={`text-3xl font-bold ${getCPUColor(currentCPU)} transition-colors`}>
                  {currentCPU.toFixed(1)}%
                </p>
                <Zap className={`w-4 h-4 absolute top-3 right-3 ${currentCPU > 50 ? 'text-pink-500 animate-pulse' : 'text-slate-600'}`} />
              </div>

              <div className="glass-panel p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Peak CPU</p>
                <p className="text-3xl font-bold text-purple-400">
                  {peakCPU.toFixed(1)}%
                </p>
                <BarChart3 className="w-4 h-4 absolute top-3 right-3 text-slate-600" />
              </div>
            </div>

            {/* Play Controls */}
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-pink-400" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Twinkle Twinkle Performance</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:8766/workload/start', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (response.ok) {
                      console.log('Twinkle Twinkle started!');
                    }
                  } catch (err) {
                    console.error('Failed to start workload:', err);
                  }
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg font-medium text-sm transition-all duration-200 active:scale-95"
              >
                ▶ Play Twinkle Twinkle
              </button>
            </div>

            {/* Live Graph */}
            <div className="glass-panel p-4 h-[280px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">CPU History</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-xs text-slate-500">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>

              <div className="h-[calc(100%-2rem)] relative">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[25, 50, 75].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#334155"
                      strokeWidth="0.5"
                      strokeDasharray="2"
                    />
                  ))}

                  {/* Area fill */}
                  <path
                    d={cpuHistory.length > 0 ? `M 0,${100 - cpuHistory[0]} ${cpuHistory.map((v, i) =>
                      `L ${(i / Math.max(cpuHistory.length - 1, 1)) * 100},${100 - v}`
                    ).join(' ')} L 100,100 L 0,100 Z` : ''}
                    fill="url(#areaGradient)"
                  />

                  {/* Line */}
                  <path
                    d={cpuHistory.length > 0 ? `M 0,${100 - cpuHistory[0]} ${cpuHistory.map((v, i) =>
                      `L ${(i / Math.max(cpuHistory.length - 1, 1)) * 100},${100 - v}`
                    ).join(' ')}` : ''}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Current point */}
                  <circle
                    cx="100"
                    cy={100 - (cpuHistory[cpuHistory.length - 1] || 0)}
                    r="2"
                    fill="#ec4899"
                  />
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-600 -ml-1">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
              </div>
            </div>

            {/* Sheet Music Display */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sheet Music - Twinkle Twinkle</p>
                </div>
                <span className="text-sm text-cyan-400 font-bold">
                  Now: {NOTES[activeNoteIndex]}4
                </span>
              </div>

              {/* Scrolling sheet music with staff lines */}
              <div className="relative bg-white rounded-lg overflow-hidden border-2 border-slate-400 shadow-lg" style={{ height: '180px' }}>
                {/* Staff lines (5 horizontal lines) */}
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  {[30, 60, 90, 120, 150].map(y => (
                    <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="#000" strokeWidth="2" />
                  ))}
                </svg>

                {/* Notes scrolling container - smooth scroll to center active note */}
                <div 
                  className="absolute left-0 top-0 h-full flex items-stretch"
                  style={{
                    transform: `translateX(calc(50% - ${(activeNoteIndex * 100) + 50}px))`,
                    transition: 'transform 0.4s ease-out',
                  }}
                >
                  {/* Twinkle Twinkle sequence */}
                  {['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'].map((note, i) => {
                    const noteColors = {
                      'C': '#0891b2',
                      'D': '#059669',
                      'E': '#d97706',
                      'F': '#ea580c',
                      'G': '#db2777',
                      'A': '#7c3aed',
                      'B': '#dc2626',
                    };

                    // Map notes to Y positions on staff (ledger lines at 30, 60, 90, 120, 150)
                    const noteYMap = {
                      'B': 0,    // above top line
                      'A': 15,   // space above top
                      'G': 30,   // top line
                      'F': 45,   // space
                      'E': 60,   // middle line
                      'D': 75,   // space
                      'C': 90,   // middle line
                    };

                    const yPos = noteYMap[note] || 90;

                    return (
                      <div 
                        key={i} 
                        className="flex-shrink-0 flex items-start justify-center relative"
                        style={{ 
                          width: 100,
                          height: 180,
                        }}
                      >
                        {/* Crotchet note positioned on staff */}
                        <span
                          style={{
                            fontSize: i === activeNoteIndex ? 72 : 60,
                            color: i === activeNoteIndex ? noteColors[note] : '#1f2937',
                            position: 'absolute',
                            top: `${yPos}px`,
                            transform: 'translateY(-50%)',
                            transition: 'all 0.2s ease-out',
                            textShadow: i === activeNoteIndex ? `0 0 16px ${noteColors[note]}99` : 'none',
                            fontWeight: i === activeNoteIndex ? 'bold' : 'normal',
                          }}
                        >
                          ♩
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : viewMode === 'tree' ? (
          <div className="glass-panel p-4 flex-1 flex flex-col justify-center items-center text-center">
            <Network className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Binary Tree Mode</h3>
            <p className="text-slate-500">Visualization controls are automated in this mode.</p>
          </div>
        ) : viewMode === 'collision' ? (
          <div className="glass-panel p-4 flex-1 flex flex-col justify-center items-center text-center">
            <Circle className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Collision Physics Mode</h3>
            <p className="text-slate-500">Watch balls bounce and collide with elastic physics.</p>
          </div>
        ) : viewMode === 'fractal' ? (
          <div className="glass-panel p-4 flex-1 flex flex-col justify-center items-center text-center">
            <Snowflake className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Fractal Flames Mode</h3>
            <p className="text-slate-500">Iterated function system visualization.</p>
          </div>
        ) : (
          <div className="glass-panel p-4 flex-1 flex flex-col justify-center items-center text-center">
            <TrendingUp className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Collatz Conjecture</h3>
            <p className="text-slate-500">3n+1 sequence visualization.</p>
          </div>
        )}
      </div>

      {/* Right Panel - Stage */}
      <div className="w-[60%] p-4 flex flex-col">
        {viewMode === 'tree' ? (
          <div className="glass-panel flex-1 relative overflow-hidden">
            <BinaryTree />
          </div>
        ) : viewMode === 'collision' ? (
          <div className="glass-panel flex-1 relative overflow-hidden">
            <CollisionAnimation />
          </div>
        ) : viewMode === 'fractal' ? (
          <div className="glass-panel flex-1 relative overflow-hidden">
            <FractalAnimation />
          </div>
        ) : viewMode === 'collatz' ? (
          <div className="glass-panel flex-1 relative overflow-hidden">
            <CollatzAnimation />
          </div>
        ) : (
          <div className="glass-panel flex-1 relative overflow-hidden">
            {/* Visualizer Active Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isPlaying
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                : 'bg-slate-800/50 border border-slate-700/50'
                }`}>
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
                  }`} />
                <span className={`text-xs font-medium ${isPlaying ? 'text-cyan-400' : 'text-slate-500'
                  }`}>
                  {isPlaying ? 'Visualizer Active' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Algorithm Badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                <span className="text-xs font-medium text-purple-400 uppercase">
                  {selectedAlgorithm} Mode
                </span>
              </div>
            </div>

            {/* Now Playing */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-400 to-pink-500 rounded-full"
                      style={{
                        height: `${10 + (currentCPU / 100) * 15 + Math.sin(Date.now() / 200 + i) * 5}px`,
                        transition: 'height 0.1s ease-out',
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Now Playing</p>
                  <p className="text-sm text-white font-medium">CPU Symphony #{Math.floor(currentCPU)}</p>
                </div>
              </div>
            </div>

            {/* FPS Counter */}
            <div className="absolute bottom-4 right-4 z-10">
              <span className="text-xs text-slate-600">60 FPS</span>
            </div>

            {/* Stage content removed (no waiting animation) - visuals driven by sheet music and server events */}

            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30" />
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-purple-500/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-purple-500/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-pink-500/30 rounded-br-lg" />
          </div>
        )}
      </div>
    </div >
  );
}

export default App;
