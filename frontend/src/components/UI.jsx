import React from 'react';

export const Card = ({ children, className = '' }) => <section className={`card ${className}`}>{children}</section>;
export const Pill = ({ children, tone = 'muted' }) => <span className={`pill ${tone}`}>{children}</span>;
export const Stat = ({ label, value, note }) => (
  <div className="stat-card">
    <span>{label}</span>
    <strong>{value}</strong>
    {note ? <small>{note}</small> : null}
  </div>
);
export const EmptyState = ({ title, text }) => (
  <div className="empty-state">
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);