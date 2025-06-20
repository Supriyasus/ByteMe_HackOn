import React, { useEffect, useState } from "react";
import { fetchMetrics, fetchSuspiciousCustomers  } from "../services/api.js"
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement);

// === REPLACE THE OLD SuspiciousCustomersTable with this corrected version ===

const SuspiciousCustomersTable = ({ customers }) => {
  if (!customers || customers.length === 0) {
    return <p>No high-risk customer data available.</p>;
  }

  // Function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  }

  // Define style objects at the top for clarity
  const tableHeaderStyle = { textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" };
  // Create a right-aligned version for the numerical columns
  const tableHeaderRightAlignStyle = { ...tableHeaderStyle, textAlign: "right" };
  const tableCellStyle = { textAlign: "left", padding: "8px" };
  const tableCellRightAlignStyle = { ...tableCellStyle, textAlign: "right" };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>High-Risk Customer Watchlist</h3>
      <p>Top customers flagged for anomalous return behavior by the model.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={tableHeaderStyle}>Customer ID</th>
            <th style={tableHeaderStyle}>Risk Score</th>
            {/* --- THIS IS THE CORRECTED PART --- */}
            <th style={tableHeaderRightAlignStyle}>Return Rate (by items)</th>
            <th style={tableHeaderRightAlignStyle}>Value Returned</th>
            <th style={tableHeaderRightAlignStyle}>Net Spend</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.CustomerID} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tableCellStyle}>{customer.CustomerID}</td>
              <td style={{...tableCellStyle, color: 'red', fontWeight: 'bold'}}>{customer.anomaly_score.toFixed(4)}</td>
              <td style={tableCellRightAlignStyle}>{(customer.return_rate_by_items * 100).toFixed(2)}%</td>
              <td style={tableCellRightAlignStyle}>{formatCurrency(customer.total_value_returned)}</td>
              <td style={{...tableCellRightAlignStyle, color: customer.total_spend < 0 ? 'red' : 'green'}}>
                  {formatCurrency(customer.total_spend)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);

  // === ADD NEW STATE for the customer list ===
  const [suspiciousCustomers, setSuspiciousCustomers] = useState([]);


  useEffect(() => {
    async function loadMetrics() {
      const data = await fetchMetrics();
      setMetrics(data);

      // SuspiciousCustomers List
      const customersData = await fetchSuspiciousCustomers();
      setSuspiciousCustomers(customersData); 
    }
    loadMetrics();
    // loadData();
  }, []);

  if (!metrics) return <p>Loading dashboard...</p>;
  // if (!data) return <p>Loading dashboard2...</p>;

  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      <h2>Admin Trust & Safety Dashboard</h2>
      
      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        {[
          { title: "Total Listings Scanned", value: metrics.total_listings },
          { title: "Counterfeit Flagged %", value: `${metrics.counterfeit_flagged_pct}%` },
          { title: "Fake Review Detection %", value: `${metrics.fake_review_pct}%` },
          { title: "Avg. Seller Trust Score", value: metrics.avg_trust_score },
          { title: "Return Fraud Flags Today", value: metrics.return_flags_today },
        ].map((card, idx) => (
          <div key={idx} style={{
            flex: "1 1 200px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#f9f9f9"
          }}>
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px" }}>
          <h4>Flagged Reviews Over Time</h4>
          <Line data={{
            labels: metrics.review_timeline.labels,
            datasets: [{
              label: "Flagged Reviews",
              data: metrics.review_timeline.data,
              borderColor: "red",
              tension: 0.4
            }]
          }} />
        </div>

        <div style={{ flex: "1 1 400px" }}>
          <h4>Top Flagged Categories</h4>
          <Bar data={{
            labels: metrics.category_distribution.labels,
            datasets: [{
              label: "Flags",
              data: metrics.category_distribution.data,
              backgroundColor: "orange"
            }]
          }} />
        </div>
      </div>


      <SuspiciousCustomersTable customers={suspiciousCustomers} />



      {/* Activity Logs */}
      <div style={{ marginTop: "40px" }}>
        <h4>Recent Activity Logs</h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Entity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.recent_events.map((log, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{log.time}</td>
                <td>{log.event}</td>
                <td>{log.entity}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;