import React, { useState } from 'react';
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

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Seller = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const orders = [
    { id: 'ORD123', status: 'shipped', product: 'Nike Shoes', date: '2025-06-22', buyer: 'John Doe' },
    { id: 'ORD124', status: 'pending', product: 'Puma Jacket', date: '2025-06-20', buyer: 'Alice Smith' },
    { id: 'ORD125', status: 'flagged', product: 'Adidas Hat', date: '2025-06-19', buyer: 'Bob Johnson' },
    { id: 'ORD126', status: 'shipped', product: 'Reebok Cap', date: '2025-06-18', buyer: 'Jane White' },
    { id: 'ORD127', status: 'cancelled', product: 'Fila Hoodie', date: '2025-06-17', buyer: 'Tom Hardy' },
  ];

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  const productLifecycleChart = {
    labels: ['Development', 'Introduction', 'Growth', 'Maturity', 'Saturation', 'Decline'],
    datasets: [{
      label: `Lifecycle of ${selectedProduct?.product || ''}`,
      data: [0, 15, 45, 70, 55, 20], // Sample data
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4
    }]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Manage Orders</h1>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        {['all', 'pending', 'cancelled', 'shipped', 'flagged'].map(tab => (
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

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
              <td style={{ ...cellStyle, textTransform: 'capitalize' }}>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pie Chart: Top 3 Most Sold Products */}
      <div style={{ marginTop: '30px', maxWidth: '600px' }}>
        <h3>Top 3 Most Sold Products</h3>
        <Pie
          data={{
            labels: ['Nike Shoes', 'Puma Jacket', 'Adidas Hat'],
            datasets: [{
              label: 'Sold',
              data: [3, 2, 1], // Replace with real backend data if available
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              borderWidth: 1,
            }]
          }}
        />
      </div>

      {/* Bar Chart: Order Status Distribution */}
      <div style={{ marginTop: '30px', maxWidth: '600px' }}>
        <h3>Order Status Distribution</h3>
        <Bar
          data={{
            labels: ['Shipped', 'Pending', 'Flagged', 'Cancelled'],
            datasets: [{
              label: '# of Orders',
              data: [3, 2, 1, 1], // Replace with backend data if needed
              backgroundColor: '#0073e6',
              borderRadius: 4
            }]
          }}
          options={{
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </div>


      {/* Modal for Lifecycle Chart */}
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
          <h3 style={{ marginBottom: '20px' }}>Lifecycle of {selectedProduct.product}</h3>
          <Line data={productLifecycleChart} />
          <button
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#232f3e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedProduct(null)}
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