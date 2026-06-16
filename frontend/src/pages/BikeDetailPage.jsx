import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { Card, Pill } from '../components/UI';
import { currency, dateLabel } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function BikeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [bike, setBike] = useState(null);
  const [booking, setBooking] = useState({ startDate: '', endDate: '', pickupLocation: '', dropoffLocation: '', notes: '', paymentMethod: 'cash' });
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/bikes/${id}`).then(({ data }) => setBike(data.data));
  }, [id]);

  const createBooking = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/bookings', { bikeId: id, ...booking });
    setMessage(data.message);
  };

  const createReview = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/reviews', { bikeId: id, ...review });
    setMessage(data.message);
  };

  if (!bike) return <Card>Loading...</Card>;

  return (
    <div className="detail-layout">
      <Card className="detail-hero">
        <img className="detail-image" src={bike.images?.[0]?.url} alt={bike.name} />
        <div>
          <div className="bike-card-top">
            <Pill tone={bike.isAvailable ? 'success' : 'danger'}>{bike.isAvailable ? 'Available' : 'Unavailable'}</Pill>
            <Pill tone="muted">{bike.category}</Pill>
          </div>
          <h2>{bike.name}</h2>
          <p>{bike.brand} {bike.model} · {bike.year}</p>
          <div className="detail-stats">
            <strong>{currency(bike.pricePerDay)} / day</strong>
            <span>Deposit: {currency(bike.securityDeposit)}</span>
            <span>Rating: {bike.averageRating?.toFixed?.(1) || '0.0'}</span>
          </div>
          <p>{bike.description}</p>
          <p className="muted">Registered {bike.registrationNumber} · {bike.location}</p>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <h3>Book this bike</h3>
          {!user ? <p>Sign in to book this bike.</p> : (
            <form className="form-grid" onSubmit={createBooking}>
              <input type="date" value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value })} />
              <input type="date" value={booking.endDate} onChange={(e) => setBooking({ ...booking, endDate: e.target.value })} />
              <input placeholder="Pickup location" value={booking.pickupLocation} onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })} />
              <input placeholder="Dropoff location" value={booking.dropoffLocation} onChange={(e) => setBooking({ ...booking, dropoffLocation: e.target.value })} />
              <textarea placeholder="Notes" value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} />
              <select value={booking.paymentMethod} onChange={(e) => setBooking({ ...booking, paymentMethod: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="card">Card</option>
              </select>
              <button className="btn btn-primary">Create booking</button>
            </form>
          )}
        </Card>

        <Card>
          <h3>Write a review</h3>
          {!user ? <p>Sign in to review this bike.</p> : (
            <form className="form-grid" onSubmit={createReview}>
              <select value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <input placeholder="Review title" value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} />
              <textarea placeholder="Comment" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="btn btn-primary">Post review</button>
            </form>
          )}
        </Card>
      </div>

      {bike.reviews?.length > 0 && (
        <Card>
          <h3>Recent reviews</h3>
          <div className="stacked-list">
            {bike.reviews.map((item) => (
              <article key={item._id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.comment}</p>
                </div>
                <div>
                  <Pill tone="muted">{item.rating} / 5</Pill>
                  <small>{dateLabel(item.createdAt)}</small>
                </div>
              </article>
            ))}
          </div>
        </Card>
      )}

      {message && <Card>{message}</Card>}
    </div>
  );
}