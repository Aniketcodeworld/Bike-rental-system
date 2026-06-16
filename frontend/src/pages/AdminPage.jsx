import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card, Pill, Stat } from '../components/UI';
import { currency } from '../utils/format';

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setDashboard(data.data));
    api.get('/admin/users').then(({ data }) => setUsers(data.data || []));
    api.get('/bookings').then(({ data }) => setBookings(data.data || []));
  }, []);

  const toggleBlock = async (id) => {
    await api.put(`/admin/users/${id}/block`);
    const { data } = await api.get('/admin/users');
    setUsers(data.data || []);
  };

  if (!dashboard) return <Card>Loading admin dashboard...</Card>;

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <Stat label="Users" value={dashboard.stats.totalUsers} />
        <Stat label="Bikes" value={dashboard.stats.totalBikes} />
        <Stat label="Bookings" value={dashboard.stats.totalBookings} />
        <Stat label="Revenue" value={currency(dashboard.stats.totalRevenue)} />
      </section>

      <div className="two-col">
        <Card>
          <h3>Users</h3>
          <div className="stacked-list">
            {users.map((user) => (
              <div key={user._id} className="list-row">
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <button className="btn btn-ghost" onClick={() => toggleBlock(user._id)}>{user.isBlocked ? 'Unblock' : 'Block'}</button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Bookings</h3>
          <div className="stacked-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="list-row">
                <div>
                  <strong>{booking.bike?.name}</strong>
                  <p>{booking.user?.name}</p>
                </div>
                <Pill tone="muted">{booking.bookingStatus}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}