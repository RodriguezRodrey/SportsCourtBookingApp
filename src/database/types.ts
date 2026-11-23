// src/database/types.ts
// Dates are 'YYYY-MM-DD'. Times are zero-padded 'HH:MM' (24h) so string comparison works.

export type Role = 'user' | 'admin';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  sports: string[];        // e.g. ['Basketball', 'Badminton']
  pricePerHour: number;
  openTime: string;        // 'HH:MM'
  closeTime: string;       // 'HH:MM'
  courtCount: number;
  bookingLink: string | null;
  description: string | null;
}

export type NewVenue = Omit<Venue, 'id'>;

export interface Booking {
  id: number;
  userId: number;
  venueId: number;
  venueName?: string;      // filled by JOIN queries
  courtNumber: number;
  activity: string;
  date: string;
  startTime: string;
  endTime: string;
  contactNumber: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export type NewBooking = Omit<Booking, 'id' | 'createdAt' | 'status' | 'venueName'>;

export interface Maintenance {
  id: number;
  venueId: number;
  courtNumber: number | null;  // null = whole venue closed
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export type NewMaintenance = Omit<Maintenance, 'id'>;
