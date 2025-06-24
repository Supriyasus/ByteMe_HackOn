import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import FlaggedReviewsList from "../components/FlaggedReviewsList";
import {AdminBoard} from "./AdminBoard";

ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const SuspiciousCustomersTable = ({ customers }) => {
  if (!customers || customers.length === 0) return <p>No high-risk customer data available.</p>;

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>High-Risk Customer Watchlist</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th>Customer ID</th>
            <th>Risk Score</th>
            <th>Return Rate</th>
            <th>Value Returned</th>
            <th>Net Spend</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.CustomerID}>
              <td>{c.CustomerID}</td>
              <td style={{ color: 'red' }}>{c.anomaly_score.toFixed(4)}</td>
              <td>{(c.return_rate_by_items * 100).toFixed(2)}%</td>
              <td>{formatCurrency(c.total_value_returned)}</td>
              <td style={{ color: c.total_spend < 0 ? 'red' : 'green' }}>{formatCurrency(c.total_spend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [suspiciousCustomers, setSuspiciousCustomers] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch overall metrics
        const metricsRes = await axios.get("/api/metrics");
        setMetrics(metricsRes.data);

        // Fetch suspicious customers
        const customersRes = await axios.get("/api/v1/post-purchase/suspicious_customers_report");
        setSuspiciousCustomers(customersRes.data);
        
        // Fetch review stats and flagged reviews
        const reviewStatsRes = await axios.get("/api/v1/reviews/stats");
        setReviewStats({
          labels: ['Fake Reviews Flagged', 'Real Reviews Analyzed'],
          datasets: [{
            label: 'Review Analysis',
            data: [reviewStatsRes.data.fake_count || 0, reviewStatsRes.data.real_count || 0],
            backgroundColor: ['rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)'],
            borderColor: ['rgba(255,99,132,1)', 'rgba(54,162,235,1)'],
            borderWidth: 1
          }]
        });

        const flaggedRes = await axios.get("/api/v1/reviews/flagged");
        setFlaggedReviews(flaggedRes.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };

    loadData();
  }, []);

  if (!metrics) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Trust & Safety Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        {[
          { title: "Total Listings Scanned", value: metrics.total_listings },
          { title: "Counterfeit Flagged %", value: `${metrics.counterfeit_flagged_pct}%` },
          { title: "Fake Review Detection %", value: `${metrics.fake_review_pct}%` },
          { title: "Avg. Seller Trust Score", value: metrics.avg_trust_score },
          { title: "Return Fraud Flags Today", value: metrics.return_flags_today }
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

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h4>Fake vs. Real Reviews Ratio</h4>
          <Pie data={reviewStats} />
          {/* <Pie data={reviewStats} options={{ responsive: true, plugins: { legend: { position: 'top' }}}}/> */}
        </div>
        <div style={{ flex: '2 1 600px' }}>
          <FlaggedReviewsList reviews={flaggedReviews} />
        </div>
      </div>

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