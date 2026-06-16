import React, { useEffect, useState } from 'react';
import api from '../api/client';
import BikeCard from '../components/BikeCard';
import { Card } from '../components/UI';

export default function BikesPage() {
  const [filters, setFilters] = useState({ search: '', category: '', fuelType: '', minPrice: '', maxPrice: '' });
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
      params.append('limit', '24');
      const { data } = await api.get(`/bikes?${params.toString()}`);
      setBikes(data.data || []);
    };
    load();
  }, [filters]);

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <h2>Bike inventory</h2>
          <p>Search and filter the catalog from the backend.</p>
        </div>
      </section>
      <Card>
        <div className="filter-grid">
          <input placeholder="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <input placeholder="Fuel type" value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })} />
          <input placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          <input placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        </div>
      </Card>

      <div className="grid bikes-grid">
        {bikes.map((bike) => <BikeCard key={bike._id} bike={bike} />)}
      </div>
    </div>
  );
}