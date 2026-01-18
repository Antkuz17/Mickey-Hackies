#!/usr/bin/env python3
"""
CPU Monitor WebSocket Server
Streams real-time CPU data to the frontend
"""

import asyncio
import psutil
from aiohttp import web
import aiohttp_cors
import time
import threading
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Global CPU state for accurate readings
class CPUMonitor:
    def __init__(self):
        self.current_cpu = 0.0
        self.cpu_history = []
        self.buffer_size = 10  # Increased for smoother readings
        # Prime the pump with initial call
        psutil.cpu_percent(interval=0.1)

    def get_cpu_percent(self):
        """Get CPU percentage with stronger smoothing"""
        try:
            # Use psutil's built-in cpu_percent (non-blocking after first call)
            cpu_percent = psutil.cpu_percent(interval=None)
            
            # Strong smoothing - more history
            self.cpu_history.append(cpu_percent)
            if len(self.cpu_history) > self.buffer_size:
                self.cpu_history.pop(0)

            # Weighted moving average (prioritize recent values slightly)
            weights = [1 + (i / self.buffer_size) for i in range(len(self.cpu_history))]
            weighted_sum = sum(h * w for h, w in zip(self.cpu_history, weights))
            self.current_cpu = weighted_sum / sum(weights)
            
            # Clamp to 0-100
            self.current_cpu = max(0, min(100, self.current_cpu))
        except Exception as e:
            print(f"Error reading CPU: {e}")
            # Return last known value
            pass

        return round(self.current_cpu, 1)


# Track connected websockets so we can broadcast events (note starts, etc.)
connected_websockets = set()


async def broadcast_event(event: dict):
    """Send an event dict to all connected websocket clients (safe)."""
    # Copy to avoid mutation during iteration
    clients = list(connected_websockets)
    if not clients:
        return

    for ws in clients:
        try:
            if not ws.closed:
                await ws.send_json(event)
        except Exception as e:
            # Remove bad sockets
            try:
                connected_websockets.discard(ws)
            except Exception:
                pass
            print(f"Failed to send event to client: {e}")

# Global monitor instance and workload state
cpu_monitor = CPUMonitor()
workload_thread = None
workload_active = False

async def cpu_websocket_handler(request):
    """WebSocket handler for streaming CPU data"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    print("Client connected to CPU WebSocket")

    # register
    connected_websockets.add(ws)

    try:
        while not ws.closed:
            try:
                # Get accurate CPU percentage
                cpu_percent = cpu_monitor.get_cpu_percent()

                # Also get per-core for reference
                per_cpu = psutil.cpu_percent(interval=None, percpu=True)

                # Get memory info
                memory = psutil.virtual_memory()

                data = {
                    "cpu": cpu_percent,
                    "per_cpu": [round(c, 1) for c in per_cpu],
                    "memory_percent": round(memory.percent, 1),
                    "timestamp": time.time()
                }

                await ws.send_json(data)
                await asyncio.sleep(0.15)  # 150ms update interval
            except Exception as e:
                print(f"Error in WebSocket loop: {e}")
                await asyncio.sleep(0.1)
                break

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # unregister
        try:
            connected_websockets.discard(ws)
        except Exception:
            pass
        print("Client disconnected from CPU WebSocket")

    return ws

async def cpu_http_handler(request):
    """HTTP endpoint for single CPU reading"""
    cpu_percent = cpu_monitor.get_cpu_percent()
    per_cpu = psutil.cpu_percent(interval=None, percpu=True)
    memory = psutil.virtual_memory()

    data = {
        "cpu": cpu_percent,
        "per_cpu": [round(c, 1) for c in per_cpu],
        "memory_percent": round(memory.percent, 1),
    }

    return web.json_response(data)

async def health_handler(request):
    """Health check endpoint"""
    return web.json_response({"status": "ok"})

async def start_workload_handler(request):
    """Start the Twinkle Twinkle workload"""
    global workload_thread, workload_active
    
    try:
        import test_workloads

        if workload_active:
            return web.json_response({"error": "Workload already running"}, status=400)

        # Provide a thread-safe notifier so test_workloads can announce note starts
        loop = asyncio.get_running_loop()

        def _notify(note, index=None):
            # Schedule broadcast from background threads safely
            event = {"event": "note_start", "note": note, "index": index, "timestamp": time.time()}
            try:
                asyncio.run_coroutine_threadsafe(broadcast_event(event), loop)
            except Exception as e:
                print(f"Failed to schedule note broadcast: {e}")

        # Attach callback so the workload code can call it
        test_workloads.note_callback = _notify

        workload_active = True
        workload_thread = threading.Thread(target=test_workloads.play_twinkle_twinkle, daemon=True)
        workload_thread.start()

        return web.json_response({"status": "Twinkle Twinkle started"})
    except Exception as e:
        workload_active = False
        return web.json_response({"error": str(e)}, status=500)

async def workload_status_handler(request):
    """Check if workload is running"""
    return web.json_response({"active": workload_active})

def create_app():
    app = web.Application()

    # Setup CORS
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*"
        )
    })

    # Add routes
    app.router.add_get("/ws", cpu_websocket_handler)
    app.router.add_get("/cpu", cpu_http_handler)
    app.router.add_get("/health", health_handler)
    app.router.add_post("/workload/start", start_workload_handler)
    app.router.add_get("/workload/status", workload_status_handler)

    # Apply CORS to all routes except WebSocket
    for route in list(app.router.routes()):
        if route.resource.canonical != "/ws":
            cors.add(route)

    return app

if __name__ == "__main__":
    print("Starting CPU Monitor Server on http://0.0.0.0:8767")
    print("WebSocket endpoint: ws://localhost:8767/ws")
    print("HTTP endpoint: http://localhost:8767/cpu")
    app = create_app()
    web.run_app(app, host="0.0.0.0", port=8767)
