import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span>BikeRental</span>
          <small>Rental command center</small>
        </Link>

        <nav className="nav-stack">
          <NavLink className={navLinkClass} to="/">Home</NavLink>
          <NavLink className={navLinkClass} to="/bikes">Bikes</NavLink>
          <NavLink className={navLinkClass} to="/bookings">Bookings</NavLink>
          <NavLink className={navLinkClass} to="/profile">Profile</NavLink>
          {user?.role === 'admin' && <NavLink className={navLinkClass} to="/admin">Admin</NavLink>}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="user-chip">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link className="btn btn-primary" to="/auth">Sign in</Link>
          )}
        </div>
      </aside>

      <main className="content-area">
        {children}
      </main>
    </div>
  );
}