import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card, EmptyState, Pill } from '../components/UI';
import { currency, dateLabel, statusTone } from '../utils/format';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.data || []));
  }, []);

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <h2>My bookings</h2>
          <p>Track approvals, cancellations, and completed rentals.</p>
        </div>
      </section>

      {bookings.length === 0 ? <EmptyState title="No bookings yet" text="Create a booking from any bike detail page." /> : (
        <div className="stacked-list">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <div className="list-row">
                <div>
                  <strong>{booking.bike?.name}</strong>
                  <p>{dateLabel(booking.startDate)} to {dateLabel(booking.endDate)}</p>
                </div>
                <div>
                  <Pill tone={statusTone(booking.bookingStatus)}>{booking.bookingStatus}</Pill>
                  <p>{currency(booking.totalAmount)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}