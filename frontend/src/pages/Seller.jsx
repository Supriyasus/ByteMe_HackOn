import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Seller = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([
    { id: 'ORD123', status: 'purchased', product: 'Nike Shoes', date: '2025-06-22', buyer: 'John Doe' },
    { id: 'ORD124', status: 'reviewed', product: 'Puma Jacket', date: '2025-06-20', buyer: 'Alice Smith' },
    { id: 'ORD125', status: 'flagged_fraud', product: 'Adidas Hat', date: '2025-06-19', buyer: 'Bob Johnson' },
    { id: 'ORD126', status: 'returned', product: 'Reebok Cap', date: '2025-06-18', buyer: 'Jane White' },
    { id: 'ORD127', status: 'delivered', product: 'Fila Hoodie', date: '2025-06-17', buyer: 'Tom Hardy' },
  ]);

  const productCurves = {
    'Nike Shoes': { listed: 5, purchased: 30, delivered: 80, reviewed: 90, returned: 20, flagged_fraud: 5 },
    'Adidas Hat': { listed: 10, purchased: 50, delivered: 55, reviewed: 20, returned: 45, flagged_fraud: 40 },
    'Puma Jacket': { listed: 5, purchased: 40, delivered: 70, reviewed: 85, returned: 35, flagged_fraud: 8 },
    'Reebok Cap': { listed: 7, purchased: 25, delivered: 60, reviewed: 75, returned: 45, flagged_fraud: 12 },
    'Fila Hoodie': { listed: 8, purchased: 35, delivered: 90, reviewed: 95, returned: 25, flagged_fraud: 4 }
  };

  const defaultCurve = { listed: 5, purchased: 20, delivered: 50, reviewed: 70, returned: 40, flagged_fraud: 10 };
  const allStages = ['listed', 'purchased', 'delivered', 'reviewed', 'returned', 'flagged_fraud'];
  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  useEffect(() => {
    fetch('http://localhost:8000/ingest/flagged_items/')
      .then(res => res.json())
      .then(data => {
        setNotifications(prev => [
          ...prev,
          ...data.map(item => ({
            product: item.title,
            seller_id: item.seller_id,
            status: 'flagged',
            timestamp: item.timestamp
          }))
        ]);
      });

    fetch('http://localhost:8000/ingest/authentic_items/')
      .then(res => res.json())
      .then(data => {
        const newItems = data.map(item => ({
          id: `AUTH-${item.product_id}`,
          status: 'authentic',
          product: item.title,
          date: new Date(item.timestamp).toISOString().split('T')[0],
          buyer: `Seller ${item.seller_id}`
        }));
        setOrders(prev => [...prev, ...newItems]);
        setNotifications(prev => [
          ...prev,
          ...data.map(item => ({
            product: item.title,
            seller_id: item.seller_id,
            status: 'listed',
            timestamp: item.timestamp
          }))
        ]);
      });
  }, []);

  const getChartData = () => {
    const curve = productCurves[selectedProduct?.product] || defaultCurve;
    const yValues = allStages.map(stage => curve[stage]);
    return {
      labels: allStages.map(stage => stage.replace('_', ' ')),
      datasets: [{
        label: `Lifecycle of ${selectedProduct?.product || ''}`,
        data: yValues,
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manage Orders</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        {['all', 'pending', 'cancelled', 'shipped', 'flagged_fraud', 'returned', 'purchased', 'delivered', 'reviewed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab ? '#232f3e' : '#e0e0e0',
              color: activeTab === tab ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={cellStyle}>Order ID</th>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Buyer</th>
            <th style={cellStyle}>Date</th>
            <th style={cellStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td style={cellStyle}>{order.id}</td>
              <td
                style={{ ...cellStyle, color: '#0073e6', cursor: 'pointer' }}
                onClick={() => setSelectedProduct(order)}
              >
                {order.product}
              </td>
              <td style={cellStyle}>{order.buyer}</td>
              <td style={cellStyle}>{order.date}</td>
              <td style={cellStyle}>{order.status.replace('_', ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ textAlign: 'center' }}>Top 3 Most Sold Products</h3>
          <Pie
            data={{
              labels: ['Nike Shoes', 'Puma Jacket', 'Adidas Hat'],
              datasets: [{
                label: 'Sold',
                data: [3, 2, 1],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderWidth: 1,
              }]
            }}
          />
        </div>

        <div style={{ flex: '1', minWidth: '300px', height: '400px' }}>
          <h3 style={{ textAlign: 'center' }}>Order Status Distribution</h3>
          <Bar
            data={{
              labels: ['Purchased', 'Reviewed', 'Flagged Fraud', 'Returned', 'Delivered'],
              datasets: [{
                label: '# of Orders',
                data: [
                  orders.filter(o => o.status === 'purchased').length,
                  orders.filter(o => o.status === 'reviewed').length,
                  orders.filter(o => o.status === 'flagged_fraud').length,
                  orders.filter(o => o.status === 'returned').length,
                  orders.filter(o => o.status === 'delivered').length
                ],
                backgroundColor: '#0073e6',
                borderRadius: 4
              }]
            }}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              animation: { duration: 1000 },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}
          />
        </div>
      </div>

      {/* Notification Table */}
      <h3>📢 Product Ingestion Notifications</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e6f2ff' }}>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Seller ID</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {notifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((item, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{item.product}</td>
                <td style={cellStyle}>{item.seller_id}</td>
                <td style={{ ...cellStyle, color: item.status === 'flagged' ? 'red' : 'green' }}>
                  {item.status.toUpperCase()}
                </td>
                <td style={cellStyle}>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Lifecycle Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '500px'
        }}>
          <h3>Lifecycle of {selectedProduct.product}</h3>
          <Line data={getChartData()} options={{
            responsive: true,
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Units' } },
              x: { title: { display: true, text: 'Stage' } }
            }
          }} />
          <button
            onClick={() => setSelectedProduct(null)}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#232f3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const cellStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  whiteSpace: 'nowrap'
};

export default Seller;
