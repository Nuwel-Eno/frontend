import React, { useEffect, useState } from 'react';
import InventoryChart from '../components/InventoryChart';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to load inventory data:', err));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="inventory-page" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>📦 Inventory Overview</h2>

      {/* Search and Filter Controls */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low">Low</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}
      >
        <h3>Inventory List</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No products found.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>{p.name}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>{p.quantity}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inventory Charts */}
      <InventoryChart products={filteredProducts} />
    </div>
  );
};

export default Inventory;