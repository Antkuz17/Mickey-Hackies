import psutil
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from collections import deque
import time
import numpy as np

# Configuration
UPDATE_INTERVAL = 100  # milliseconds
HISTORY_LENGTH = 100  # number of data points to show
SMOOTHING_WINDOW = 5  # number of samples to average for smoothing

# Data storage
timestamps = deque(maxlen=HISTORY_LENGTH)
cpu_percentages = deque(maxlen=HISTORY_LENGTH)
raw_cpu_readings = deque(maxlen=SMOOTHING_WINDOW)
start_time = time.time()

# Initialize CPU monitoring (first call is always 0)
psutil.cpu_percent(interval=None)

# Setup plot
fig, ax = plt.subplots(figsize=(12, 6))
line, = ax.plot([], [], 'b-', linewidth=2, label='CPU Usage')
raw_line, = ax.plot([], [], 'r-', linewidth=1, alpha=0.3, label='Raw CPU')
ax.set_ylim(0, 100)
ax.set_xlabel('Time (seconds)', fontsize=12)
ax.set_ylabel('CPU Usage (%)', fontsize=12)
ax.set_title('Live CPU Usage Monitor', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3)
ax.axhline(y=30, color='green', linestyle='--', alpha=0.5, label='30% target')
ax.axhline(y=50, color='orange', linestyle='--', alpha=0.5, label='50% target')
ax.axhline(y=80, color='red', linestyle='--', alpha=0.5, label='80% target')
ax.legend(loc='upper right')

def init():
    """Initialize the plot."""
    ax.set_xlim(0, 10)
    return line, raw_line

def update(frame):
    """Update the plot with new CPU data."""
    current_time = time.time() - start_time

    # Get CPU percentage (non-blocking, measures since last call)
    cpu_percent = psutil.cpu_percent(interval=None)

    # Store raw reading
    raw_cpu_readings.append(cpu_percent)

    # Calculate smoothed value using moving average
    smoothed_cpu = np.mean(raw_cpu_readings)

    timestamps.append(current_time)
    cpu_percentages.append(smoothed_cpu)

    # Update plot data
    line.set_data(list(timestamps), list(cpu_percentages))
    raw_line.set_data(list(timestamps), list(cpu_percentages))

    # Adjust x-axis to show rolling window
    if len(timestamps) > 0:
        ax.set_xlim(max(0, current_time - 10), current_time + 1)

    # Display current CPU percentage in title
    ax.set_title(f'Live CPU Usage Monitor - Current: {smoothed_cpu:.1f}% (Raw: {cpu_percent:.1f}%)',
                 fontsize=14, fontweight='bold')

    return line, raw_line

# Create animation
ani = FuncAnimation(fig, update, init_func=init, interval=UPDATE_INTERVAL,
                    blit=True, cache_frame_data=False)

print("CPU Monitor started. Close the window to exit.")
plt.tight_layout()
plt.show()
