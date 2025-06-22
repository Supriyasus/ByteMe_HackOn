import React from 'react';

const FlaggedReviewsList = ({ reviews }) => {
  const componentStyles = {
    container: { marginTop: '40px' },
    tableContainer: { maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f2f2f2', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ccc', position: 'sticky', top: 0 },
    td: { padding: '12px', borderBottom: '1px solid #ddd' },
  };
  
  if (!reviews || reviews.length === 0) {
    return (
        <div style={componentStyles.container}>
            <h3>Flagged Reviews from Dataset Analysis</h3>
            <p>No suspicious reviews found in the dataset analysis.</p>
        </div>
    );
  }

  return (
    <div style={componentStyles.container}>
      <h3>Flagged Reviews from Dataset Analysis</h3>
      <div style={componentStyles.tableContainer}>
        <table style={componentStyles.table}>
          <thead>
            <tr>
              {/* REMOVED Timestamp TH */}
              <th style={componentStyles.th}>Rating</th>
              <th style={componentStyles.th}>Detected Sentiment</th>
              <th style={componentStyles.th}>Review Text (excerpt)</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr key={index}>
                {/* REMOVED Timestamp TD */}
                <td style={{...componentStyles.td, textAlign: 'center'}}>{review.rating}</td>
                <td style={componentStyles.td}>{review.sentiment}</td>
                <td style={componentStyles.td}>{review.review.substring(0, 120)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlaggedReviewsList;