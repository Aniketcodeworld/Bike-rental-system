import React from 'react';
import { Link } from 'react-router-dom';
import { currency } from '../utils/format';
import { Pill } from './UI';

export default function BikeCard({ bike }) {
  const image = bike?.images?.[0]?.url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="bike-card">
      <img src={image} alt={bike.name} />
      <div className="bike-card-body">
        <div className="bike-card-top">
          <Pill tone={bike.isAvailable ? 'success' : 'danger'}>{bike.isAvailable ? 'Available' : 'Booked'}</Pill>
          <Pill tone="muted">{bike.category}</Pill>
        </div>
        <h3>{bike.name}</h3>
        <p>{bike.brand} {bike.model} · {bike.year}</p>
        <div className="bike-meta">
          <strong>{currency(bike.pricePerDay)}</strong>
          <span>{bike.averageRating?.toFixed?.(1) || '0.0'} rating</span>
        </div>
        <Link className="btn btn-primary btn-block" to={`/bikes/${bike._id}`}>View details</Link>
      </div>
    </article>
  );
}