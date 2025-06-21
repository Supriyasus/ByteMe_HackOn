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



// // Fake Review Detection:
// export async function analyzeFakeReview(reviewText, rating) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/v1/reviews/detect_fake`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         review_text: reviewText,
//         rating: parseFloat(rating),
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Failed to analyze review:", error);
//     // Return an error object to be handled by the component
//     return { error: error.message };
//   }
// }
// // End of Fake Review Detection


export async function fetchFlaggedReviews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews/flagged`);
    if (!response.ok) {
      console.error("API Error in fetchFlaggedReviews: Server responded with status", response.status);
      return []; // Return an empty array on error
    }
    return await response.json();
    
  } catch (error) {
    console.error("Network Error:", error);
    return [];
  }
}

export async function fetchFakeReviewStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews/stats`);
    if (!response.ok) {
        console.error("API Error: Failed to fetch review stats");
        return []; // Return empty array on error
    }
    return await response.json();
  } catch (error) {
    console.error("Network Error:", error);
    return [];
  }
}