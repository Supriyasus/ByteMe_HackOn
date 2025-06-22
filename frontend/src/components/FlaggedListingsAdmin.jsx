import React, { useEffect, useState } from 'react';
import { fetchAdminFlaggedListings } from '../services/api';

const FlaggedListingsAdmin = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      setIsLoading(true);
      const data = await fetchAdminFlaggedListings();
      setListings(data);
      setIsLoading(false);
    }
    loadListings();
  }, []);

  return (
    <div style={styles.container}>
      <h3>Admin Panel: Flagged Product Listings</h3>
      <p>This list is populated by the "Upload New Product Listing" feature when a counterfeit is suspected.</p>
      {isLoading ? <p>Loading flagged listings...</p> : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Seller ID</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Claimed Brand</th>
                <th style={styles.th}>Predicted Brand</th>
                <th style={styles.th}>Score</th>
              </tr>
            </thead>
            <tbody>
              {listings.length > 0 ? listings.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{new Date(item.timestamp).toLocaleString()}</td>
                  <td style={styles.td}>{item.seller_id}</td>
                  <td style={styles.td}>{item.title}</td>
                  <td style={styles.td}>{item.claimed_brand}</td>
                  <td style={styles.td}>{item.predicted_brand}</td>
                  <td style={styles.td}>{item.similarity_score.toFixed(3)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No listings have been flagged as counterfeit yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
    container: { marginTop: '40px' },
    tableContainer: { maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f2f2f2', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ccc', position: 'sticky', top: 0 },
    td: { padding: '12px', borderBottom: '1px solid #ddd' },
};

export default FlaggedListingsAdmin;