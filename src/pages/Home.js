import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const chartData = {
    labels: ['In Stock', 'Low', 'Out of Stock'],
    datasets: [
      {
        label: 'Inventory Overview',
        data: [45, 12, 5],
        backgroundColor: ['#008080', '#ffc107', '#dc3545'],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div
      className="home-wrapper"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: 'url("https://res.cloudinary.com/dt2wsybjb/image/upload/v1748187506/Image_fx_picjgj.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <div
        className="overlay"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}
      />

      <motion.div
        className="home-page"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          📦 Welcome to Inventory Control System
        </h1>
        <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '600px' }}>
          Manage, monitor and analyze your product inventory in real time with smart scanning, charts, and access tracking.
        </p>

        <motion.div
          className="home-buttons"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/dashboard">
            <button className="home-btn">Dashboard</button>
          </Link>
          <Link to="/inventory">
            <button className="home-btn">Inventory</button>
          </Link>
          <Link to="/scanner">
            <button className="home-btn">Scanner</button>
          </Link>
        </motion.div>

        <div style={{ maxWidth: '300px', marginBottom: '2rem' }}>
          <h3>Inventory Preview</h3>
          <Pie data={chartData} />
        </div>

        <p style={{ fontStyle: 'italic', color: '#ccc' }}>
          Tip: Webcam recording helps track admin sessions securely.
        </p>
      </motion.div>

      <style>{`
        .home-btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          background-color: #007b7b;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .home-btn:hover {
          background-color: #00b3b3;
        }

        @media (max-width: 600px) {
          .home-btn {
            width: 100%;
            font-size: 1.1rem;
          }

          .home-page h1 {
            font-size: 2rem;
          }

          .home-page p {
            font-size: 1rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;