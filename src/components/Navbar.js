import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link> {/* 👈 Add this */}
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/scanner">Scanner</Link>
      <Link to="/inventory">Inventory</Link>
    </nav>
  );
};

export default Navbar;
