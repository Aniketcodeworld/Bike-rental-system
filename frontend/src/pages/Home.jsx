import React, { useEffect, useState } from 'react';
import api from '../api/client';
import BikeCard from '../components/BikeCard';
import { Card, Stat } from '../components/UI';

export default function Home() {
  const [bikes, setBikes] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [bikesRes, dashRes] = await Promise.allSettled([
        api.get('/bikes?limit=6&sortBy=averageRating&order=desc'),
        api.get('/admin/dashboard').catch(() => null),
      ]);

      if (bikesRes.status === 'fulfilled') setBikes(bikesRes.value.data.data || []);
      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        const s = dashRes.value.data.data.stats;
        setStats([
          { label: 'Bikes', value: s.totalBikes },
          { label: 'Bookings', value: s.totalBookings },
          { label: 'Revenue', value: s.totalRevenue },
          { label: 'Available', value: s.availableBikes },
        ]);
      }
    };
    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="hero card">
        <div>
          <span className="eyebrow">Bike rental operations</span>
          <h1>Manage discovery, booking, reviews, and admin work in one place.</h1>
          <p>Connected directly to your backend API with auth, bike inventory, booking lifecycle, and dashboard analytics.</p>
        </div>
        <div className="hero-grid">
          <Stat label="Fast search" value="API-backed" note="Filters and pagination" />
          <Stat label="Booking flow" value="Ready" note="User to admin approval" />
          <Stat label="Admin panel" value="Ready" note="Users, bikes, bookings" />
        </div>
      </section>

      {stats.length > 0 && (
        <section className="stats-grid">
          {stats.map((item) => <Stat key={item.label} {...item} />)}
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>Featured bikes</h2>
          <p>Loaded from the live backend.</p>
        </div>
        <div className="grid bikes-grid">
          {bikes.map((bike) => <BikeCard key={bike._id} bike={bike} />)}
        </div>
      </section>
    </div>
  );
}