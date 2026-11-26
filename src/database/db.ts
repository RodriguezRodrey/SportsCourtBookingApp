// src/database/db.ts
// Install: npx expo install expo-sqlite expo-crypto
import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import type {
  Booking,
  Maintenance,
  NewBooking,
  NewMaintenance,
  NewVenue,
  User,
  Venue,
} from "./types";

/* ---------- Connection ---------- */

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("courts.db");
  return dbPromise;
}

/* ---------- Schema ---------- */

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS venues (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  location       TEXT NOT NULL,
  sports         TEXT NOT NULL,              -- comma-separated: 'Basketball,Badminton'
  price_per_hour REAL NOT NULL CHECK (price_per_hour >= 0),
  open_time      TEXT NOT NULL,
  close_time     TEXT NOT NULL,
  court_count    INTEGER NOT NULL DEFAULT 1 CHECK (court_count >= 1),
  booking_link   TEXT,
  description    TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  venue_id       INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_number   INTEGER NOT NULL,
  activity       TEXT NOT NULL,
  date           TEXT NOT NULL,
  start_time     TEXT NOT NULL,
  end_time       TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  total_price    REAL NOT NULL,
  status         TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS maintenance (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id     INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_number INTEGER,                      -- NULL = whole venue
  date         TEXT NOT NULL,
  start_time   TEXT NOT NULL,
  end_time     TEXT NOT NULL,
  reason       TEXT,
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_court   ON bookings(venue_id, court_number, date);
CREATE INDEX IF NOT EXISTS idx_bookings_contact ON bookings(contact_number, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_maint_venue      ON maintenance(venue_id, date);
`;

/* ---------- Row mappers (snake_case -> camelCase) ---------- */

const toUser = (r: any): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  createdAt: r.created_at,
});

const toVenue = (r: any): Venue => ({
  id: r.id,
  name: r.name,
  location: r.location,
  sports: r.sports ? String(r.sports).split(",") : [],
  pricePerHour: r.price_per_hour,
  openTime: r.open_time,
  closeTime: r.close_time,
  courtCount: r.court_count,
  bookingLink: r.booking_link,
  description: r.description,
});

const toBooking = (r: any): Booking => ({
  id: r.id,
  userId: r.user_id,
  venueId: r.venue_id,
  venueName: r.venue_name,
  courtNumber: r.court_number,
  activity: r.activity,
  date: r.date,
  startTime: r.start_time,
  endTime: r.end_time,
  contactNumber: r.contact_number,
  totalPrice: r.total_price,
  status: r.status,
  createdAt: r.created_at,
});

const toMaintenance = (r: any): Maintenance => ({
  id: r.id,
  venueId: r.venue_id,
  courtNumber: r.court_number,
  date: r.date,
  startTime: r.start_time,
  endTime: r.end_time,
  reason: r.reason,
});

/* ---------- Init + seed ---------- */

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(SCHEMA);
  await seedDatabaseIfNeeded();
}

async function seedDatabaseIfNeeded() {
  await seedDefaultAccounts();

  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM venues",
  );
  if (row && row.n > 0) return;

  // SAMPLE DATA: replace with the real venues your group collected.
  const venues: NewVenue[] = [
    {
      name: "Sample Sports Complex",
      location: "Tagum City",
      sports: ["Basketball", "Volleyball"],
      pricePerHour: 400,
      openTime: "08:00",
      closeTime: "22:00",
      courtCount: 2,
      bookingLink: null,
      description: "Indoor courts with lights.",
    },
    {
      name: "Sample Badminton Hall",
      location: "Tagum City",
      sports: ["Badminton"],
      pricePerHour: 250,
      openTime: "09:00",
      closeTime: "21:00",
      courtCount: 4,
      bookingLink: null,
      description: "Four wooden-floor badminton courts.",
    },
    {
      name: "Sample Futsal Arena",
      location: "Tagum City",
      sports: ["Futsal", "Football"],
      pricePerHour: 800,
      openTime: "10:00",
      closeTime: "23:00",
      courtCount: 1,
      bookingLink: null,
      description: "Artificial turf, 5-a-side.",
    },
  ];
  for (const v of venues) await createVenue(v);
}

async function seedDefaultAccounts(): Promise<void> {
  await seedDefaultAccount(
    "Administrator",
    "admin@court.app",
    "admin123",
    "admin",
  );
  await seedDefaultAccount("User", "user@court.app", "user123", "user");
}

async function seedDefaultAccount(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin",
): Promise<void> {
  const db = await getDb();
  const hash = await hashPassword(password);
  await db.runAsync(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO NOTHING`,
    [name, email, hash, role],
  );
}

/* ---------- Users ---------- */

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
  );
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user",
): Promise<number> {
  const db = await getDb();
  const hash = await hashPassword(password);
  const res = await db.runAsync(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name.trim(), email.trim().toLowerCase(), hash, role],
  );
  return res.lastInsertRowId; // throws if email already exists (UNIQUE)
}

/** Returns the user on success, or null if email/password is wrong. */
export async function loginUser(
  email: string,
  password: string,
): Promise<User | null> {
  const db = await getDb();
  const hash = await hashPassword(password);
  const row = await db.getFirstAsync(
    "SELECT * FROM users WHERE email = ? AND password_hash = ?",
    [email.trim().toLowerCase(), hash],
  );
  return row ? toUser(row) : null;
}

/* ---------- Venues ---------- */

/** Search by name/location (partial match) and optionally filter by sport. */
export async function getVenues(search = "", sport = ""): Promise<Venue[]> {
  const db = await getDb();
  const like = `%${search.trim()}%`;
  const rows = await db.getAllAsync(
    `SELECT * FROM venues
     WHERE (name LIKE ? OR location LIKE ?)
       AND (? = '' OR (',' || sports || ',') LIKE '%,' || ? || ',%')
     ORDER BY name`,
    [like, like, sport, sport],
  );
  return rows.map(toVenue);
}

export async function getVenueById(id: number): Promise<Venue | null> {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT * FROM venues WHERE id = ?", [id]);
  return row ? toVenue(row) : null;
}

export async function getAllSports(): Promise<string[]> {
  const venues = await getVenues();
  return [...new Set(venues.flatMap((v) => v.sports))].sort();
}

export async function createVenue(v: NewVenue): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO venues (name, location, sports, price_per_hour, open_time, close_time,
                         court_count, booking_link, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      v.name,
      v.location,
      v.sports.join(","),
      v.pricePerHour,
      v.openTime,
      v.closeTime,
      v.courtCount,
      v.bookingLink,
      v.description,
    ],
  );
  return res.lastInsertRowId;
}

export async function updateVenue(id: number, v: NewVenue): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE venues SET name=?, location=?, sports=?, price_per_hour=?, open_time=?,
            close_time=?, court_count=?, booking_link=?, description=? WHERE id=?`,
    [
      v.name,
      v.location,
      v.sports.join(","),
      v.pricePerHour,
      v.openTime,
      v.closeTime,
      v.courtCount,
      v.bookingLink,
      v.description,
      id,
    ],
  );
}

export async function deleteVenue(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM venues WHERE id = ?", [id]);
}

/* ---------- Bookings ---------- */

export async function createBooking(b: NewBooking): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO bookings (user_id, venue_id, court_number, activity, date, start_time,
                           end_time, contact_number, total_price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.userId,
      b.venueId,
      b.courtNumber,
      b.activity,
      b.date,
      b.startTime,
      b.endTime,
      b.contactNumber,
      b.totalPrice,
    ],
  );
  return res.lastInsertRowId;
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT b.*, v.name AS venue_name FROM bookings b
     JOIN venues v ON v.id = b.venue_id WHERE b.id = ?`,
    [id],
  );
  return row ? toBooking(row) : null;
}

/** All of one user's bookings, newest date first. Split upcoming/past in the UI. */
export async function getBookingsByUser(userId: number): Promise<Booking[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT b.*, v.name AS venue_name FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     WHERE b.user_id = ? ORDER BY b.date DESC, b.start_time DESC`,
    [userId],
  );
  return rows.map(toBooking);
}

/** Admin view: every booking. */
export async function getAllBookings(): Promise<Booking[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT b.*, v.name AS venue_name FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     ORDER BY b.date DESC, b.start_time DESC`,
  );
  return rows.map(toBooking);
}

/** Cancelled bookings are kept for history but never block a slot. */
export async function cancelBooking(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [
    id,
  ]);
}

export async function rescheduleBooking(
  id: number,
  changes: {
    courtNumber: number;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  },
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE bookings SET court_number=?, date=?, start_time=?, end_time=?, total_price=?
     WHERE id=?`,
    [
      changes.courtNumber,
      changes.date,
      changes.startTime,
      changes.endTime,
      changes.totalPrice,
      id,
    ],
  );
}

/* ---------- Queries for the validation checks ---------- */
// Each returns active bookings that OVERLAP the given time range.
// Overlap rule: existing.start < newEnd AND newStart < existing.end
// Pass excludeBookingId when rescheduling so a booking doesn't clash with itself.

/** Check 3: court overlap */
export async function findCourtConflicts(
  venueId: number,
  courtNumber: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId = -1,
): Promise<Booking[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM bookings
     WHERE venue_id=? AND court_number=? AND date=? AND status='confirmed'
       AND id != ? AND start_time < ? AND ? < end_time`,
    [venueId, courtNumber, date, excludeBookingId, endTime, startTime],
  );
  return rows.map(toBooking);
}

/** Check 4: same contact number overlapping anywhere */
export async function findContactConflicts(
  contactNumber: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId = -1,
): Promise<Booking[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM bookings
     WHERE contact_number=? AND date=? AND status='confirmed'
       AND id != ? AND start_time < ? AND ? < end_time`,
    [contactNumber, date, excludeBookingId, endTime, startTime],
  );
  return rows.map(toBooking);
}

/** Check 2: maintenance (whole-venue closures have court_number NULL) */
export async function findMaintenanceConflicts(
  venueId: number,
  courtNumber: number,
  date: string,
  startTime: string,
  endTime: string,
): Promise<Maintenance[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM maintenance
     WHERE venue_id=? AND date=? AND (court_number IS NULL OR court_number=?)
       AND start_time < ? AND ? < end_time`,
    [venueId, date, courtNumber, endTime, startTime],
  );
  return rows.map(toMaintenance);
}

/** For the booking screen: which slots are taken on a given day. */
export async function getBookingsForVenueOnDate(
  venueId: number,
  date: string,
): Promise<Booking[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM bookings WHERE venue_id=? AND date=? AND status='confirmed'
     ORDER BY court_number, start_time`,
    [venueId, date],
  );
  return rows.map(toBooking);
}

/* ---------- Maintenance (admin) ---------- */

export async function addMaintenance(m: NewMaintenance): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO maintenance (venue_id, court_number, date, start_time, end_time, reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [m.venueId, m.courtNumber, m.date, m.startTime, m.endTime, m.reason],
  );
  return res.lastInsertRowId;
}

export async function getMaintenanceByVenue(
  venueId: number,
): Promise<Maintenance[]> {
  const db = await getDb();
  const rows = await db.getAllAsync(
    "SELECT * FROM maintenance WHERE venue_id=? ORDER BY date, start_time",
    [venueId],
  );
  return rows.map(toMaintenance);
}

export async function deleteMaintenance(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM maintenance WHERE id = ?", [id]);
}
