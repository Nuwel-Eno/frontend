import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import './styles/App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/scanner"
          element={
            <Scanner onDetected={(code) => {
              toast.success(`Scanned: ${code}`);
            }} />
          }
        />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;