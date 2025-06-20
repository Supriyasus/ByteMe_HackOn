export async function fetchMetrics() {
    const res = await fetch("http://localhost:8000/api/metrics");
    return await res.json();
  }
  

const API_BASE_URL = "http://127.0.0.1:8000"; // Your backend URL

// === ADD THIS NEW FUNCTION ===
export async function fetchSuspiciousCustomers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/post-purchase/suspicious_customers_report`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch suspicious customers:", error);
    return []; // Return an empty array on error
  }
}