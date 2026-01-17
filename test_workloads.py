import time
import psutil
import numpy as np
from multiprocessing import Process, cpu_count
import threading

def get_current_cpu():
    """Get current CPU usage percentage."""
    return psutil.cpu_percent(interval=0.1)

def bubble_sort_workload(size):
    """Lightweight sorting workload."""
    arr = np.random.randint(0, 1000, size).tolist()
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

def matrix_multiplication_workload(size):
    """Medium matrix computation workload."""
    a = np.random.rand(size, size)
    b = np.random.rand(size, size)
    c = np.dot(a, b)
    return c

def heavy_computation_workload(iterations):
    """Heavy computational workload with prime number checking."""
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True

    primes = []
    for i in range(iterations):
        if is_prime(i):
            primes.append(i)
    return primes

def pathfinding_workload(grid_size):
    """Pathfinding simulation workload."""
    grid = np.random.rand(grid_size, grid_size)

    # Simple BFS-like traversal
    visited = set()
    queue = [(0, 0)]

    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))

        # Add neighbors
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < grid_size and 0 <= ny < grid_size:
                queue.append((nx, ny))

def fibonacci_workload(n):
    """Recursive fibonacci workload."""
    def fib(x):
        if x <= 1:
            return x
        return fib(x-1) + fib(x-2)

    results = []
    for i in range(n):
        results.append(fib(min(i, 30)))  # Cap at 30 to prevent too much recursion
    return results

def busy_loop_light():
    """Light CPU intensive loop - 1000x1000 matrix multiplication."""
    a = np.random.rand(1000, 1000)
    b = np.random.rand(1000, 1000)
    result = np.dot(a, b)
    return result

def busy_loop_medium():
    """Medium CPU intensive loop - 1000x1000 matrix multiplication twice."""
    a = np.random.rand(1000, 1000)
    b = np.random.rand(1000, 1000)
    result = np.dot(a, b)
    c = np.random.rand(1000, 1000)
    result = np.dot(result, c)
    return result

def busy_loop_heavy():
    """Heavy CPU intensive loop - Multiple 1000x1000 matrix multiplications."""
    a = np.random.rand(1000, 1000)
    b = np.random.rand(1000, 1000)
    result = np.dot(a, b)
    c = np.random.rand(1000, 1000)
    result = np.dot(result, c)
    d = np.random.rand(1000, 1000)
    result = np.dot(result, d)
    return result

def worker_thread(end_time, work_func):
    """Worker thread that runs work_func until end_time."""
    while time.time() < end_time:
        work_func()

def calibrated_workload_30():
    """Target ~30% CPU usage - Light workload using 2 cores (sustained 5 seconds)."""
    print("\n[30% TARGET] Running light workload on 2 threads...")
    duration = 5.0
    end_time = time.time() + duration

    # Use 2 threads for 30% (on typical 8-core system = 25% of total CPU)
    num_threads = 2
    threads = []

    for _ in range(num_threads):
        t = threading.Thread(target=worker_thread, args=(end_time, busy_loop_light))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print(f"  Completed 30% workload")
    time.sleep(2)

def calibrated_workload_50():
    """Target ~50% CPU usage - Medium workload using 4 cores (sustained 5 seconds)."""
    print("\n[50% TARGET] Running medium workload on 4 threads...")
    duration = 5.0
    end_time = time.time() + duration

    # Use 4 threads for 50% (on typical 8-core system = 50% of total CPU)
    num_threads = 4
    threads = []

    for _ in range(num_threads):
        t = threading.Thread(target=worker_thread, args=(end_time, busy_loop_medium))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print(f"  Completed 50% workload")
    time.sleep(2)

def calibrated_workload_70():
    """Target ~70% CPU usage - Heavy workload using 6 cores (sustained 5 seconds)."""
    print("\n[70% TARGET] Running heavy workload on 6 threads...")
    duration = 5.0
    end_time = time.time() + duration

    # Use 6 threads for 70% (on typical 8-core system = 75% of total CPU)
    num_threads = 6
    threads = []

    for _ in range(num_threads):
        t = threading.Thread(target=worker_thread, args=(end_time, busy_loop_heavy))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print(f"  Completed 70% workload")
    time.sleep(2)

def calibrated_workload_90():
    """Target ~90% CPU usage - Very heavy workload using ALL cores (sustained 5 seconds)."""
    print(f"\n[90% TARGET] Running very heavy workload on {cpu_count()} threads...")
    duration = 5.0
    end_time = time.time() + duration

    # Use all CPU cores for maximum load
    num_threads = cpu_count()
    threads = []

    for _ in range(num_threads):
        t = threading.Thread(target=worker_thread, args=(end_time, busy_loop_heavy))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print(f"  Completed 90% workload")
    time.sleep(2)

def run_all_workloads():
    """Run all calibrated workloads sequentially."""
    print("="*60)
    print("COMPUTATIONAL WORKLOAD TEST")
    print("="*60)
    print(f"System has {cpu_count()} CPU cores")
    print("Starting workload tests...")
    print("(Make sure cpu_monitor.py is running in another terminal)")
    print("="*60)

    time.sleep(2)  # Give time to see baseline

    # Run workloads in sequence
    calibrated_workload_30()
    calibrated_workload_50()
    calibrated_workload_70()
    calibrated_workload_90()

    # Repeat the cycle
    print("\n" + "="*60)
    print("REPEATING CYCLE...")
    print("="*60)

    calibrated_workload_30()
    calibrated_workload_50()
    calibrated_workload_70()
    calibrated_workload_90()

    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    run_all_workloads()
