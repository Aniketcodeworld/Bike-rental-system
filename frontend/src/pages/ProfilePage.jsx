import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const updateProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/profile', form);
    setMessage(data.message);
    await refreshUser();
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/change-password', passwords);
    setMessage(data.message);
  };

  return (
    <div className="two-col">
      <Card>
        <h2>Profile</h2>
        <form className="form-grid" onSubmit={updateProfile}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn btn-primary">Save profile</button>
        </form>
      </Card>

      <Card>
        <h2>Change password</h2>
        <form className="form-grid" onSubmit={changePassword}>
          <input type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          <input type="password" placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          <button className="btn btn-primary">Update password</button>
        </form>
      </Card>

      {message && <Card>{message}</Card>}
    </div>
  );
}