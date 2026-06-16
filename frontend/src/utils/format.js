import { format } from 'date-fns';

export const currency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export const dateLabel = (value) => {
  if (!value) return 'N/A';
  return format(new Date(value), 'dd MMM yyyy');
};

export const statusTone = (status) => {
  switch (status) {
    case 'approved':
    case 'active':
    case 'completed':
      return 'success';
    case 'rejected':
    case 'cancelled':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'muted';
  }
};