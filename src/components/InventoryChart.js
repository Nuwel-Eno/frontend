import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const InventoryChart = ({ products }) => {
  const statusCounts = {
    'In Stock': 0,
    'Low': 0,
    'Out of Stock': 0
  };

  products.forEach(p => {
    const status = p.status || 'In Stock';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
      }
    ]
  };

  const barData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Quantity',
        data: products.map(p => p.quantity),
        backgroundColor: '#007bff'
      }
    ]
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        marginTop: '20px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <h3>Inventory Status</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '320px' }}>
        <h3>Product Quantities</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;
