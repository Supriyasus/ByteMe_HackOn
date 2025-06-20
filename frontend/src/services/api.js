export async function fetchMetrics() {
    const res = await fetch("http://localhost:8000/api/metrics");
    return await res.json();
  }
  