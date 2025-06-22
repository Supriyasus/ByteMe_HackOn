// This is the single source of truth for all API calls from the frontend.

const API_BASE_URL = "http://127.0.0.1:8000";

// --- Utility function for handling fetch errors ---
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      // Response was not JSON, stick with the status code
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

// --- Metrics Endpoint ---
// Corresponds to: /api/metrics (Note the double /api/api/ in your list might be a typo, usually it's just /api/)
export async function fetchMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/metrics`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    // Return a default structure so the dashboard doesn't crash
    return {
      total_listings: 0,
      counterfeit_flagged_pct: 0,
      fake_review_pct: 0,
      avg_trust_score: 0,
      return_flags_today: 0,
      review_timeline: { labels: [], data: [] },
      category_distribution: { labels: [], data: [] },
      recent_events: []
    };
  }
}

// --- Post-Purchase (Refund Abuse) Endpoints ---
// Corresponds to: /api/v1/post-purchase/suspicious_customers_report
export async function fetchSuspiciousCustomers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/post-purchase/suspicious_customers_report`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch suspicious customers:", error);
    return [];
  }
}
// Note: The /score_customer/{customer_id} endpoint would need its own function if you build a UI for it.

// --- Fake Review Endpoints ---
// Corresponds to: /api/v1/reviews/flagged
export async function fetchFlaggedReviews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews/flagged`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch flagged reviews:", error);
    return [];
  }
}

// Corresponds to: /api/v1/reviews/stats
export async function fetchFakeReviewStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews/stats`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch review stats:", error);
    return [];
  }
}

// --- Counterfeit Detection Endpoint ---
// Corresponds to: /api/v1/detect/counterfeit/
export async function detectCounterfeit(imageFile, title, description) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('title', title);
  formData.append('description', description);

  try {
    // Calling the endpoint WITH a trailing slash, as confirmed by your Swagger docs.
    const response = await fetch(`${API_BASE_URL}/api/v1/detect/counterfeit/`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to detect counterfeit:", error);
    return { error: error.message };
  }
}

// You can add other functions here as needed, for example:
/*
export async function fetchAdminFlaggedItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/flagged/`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch admin flagged items:", error);
    return { flagged_listings: [] };
  }
}
*/


// === NEW FUNCTION for Ingesting a Product Listing ===
export async function ingestProductListing(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/upload_listing/`, {
      method: 'POST',
      body: formData, // formData already contains the image and other form fields
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to ingest product listing:", error);
    return { error: error.message };
  }
}


// === NEW FUNCTION for Admin to fetch flagged listings ===
export async function fetchAdminFlaggedListings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/flagged/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.flagged_listings || []; // Return the array inside the object
  } catch (error) {
    console.error("Failed to fetch admin flagged listings:", error);
    return [];
  }
}