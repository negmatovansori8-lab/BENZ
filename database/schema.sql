-- AUTOHUB marketplace schema
-- PostgreSQL 14+

-- ── Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(180) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(40),
  avatar          TEXT,
  role            VARCHAR(20) NOT NULL DEFAULT 'USER'
                    CHECK (role IN ('USER', 'SELLER', 'ADMIN')),
  is_blocked      BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Brands / Models ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80) UNIQUE NOT NULL,
  logo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS models (
  id          SERIAL PRIMARY KEY,
  brand_id    INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name        VARCHAR(80) NOT NULL,
  UNIQUE (brand_id, name)
);

-- ── Locations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  country     VARCHAR(80) NOT NULL,
  city        VARCHAR(80) NOT NULL,
  UNIQUE (country, city)
);

-- ── Cars ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars (
  id              SERIAL PRIMARY KEY,
  seller_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id        INTEGER NOT NULL REFERENCES brands(id),
  model_id        INTEGER NOT NULL REFERENCES models(id),
  year            INTEGER NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  price_usd       NUMERIC(12, 2) NOT NULL CHECK (price_usd >= 0),
  mileage         INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  engine          VARCHAR(80),
  power           INTEGER,
  fuel            VARCHAR(20) NOT NULL
                    CHECK (fuel IN ('Petrol', 'Diesel', 'Hybrid', 'Electric', 'Gas')),
  transmission    VARCHAR(20) NOT NULL
                    CHECK (transmission IN ('Automatic', 'Manual')),
  body            VARCHAR(20) NOT NULL
                    CHECK (body IN ('Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Minivan')),
  color           VARCHAR(40),
  vin             VARCHAR(32),
  location_id     INTEGER REFERENCES locations(id),
  description     TEXT,
  phone           VARCHAR(40),
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'PAUSED')),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  views           INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  sold_at         TIMESTAMPTZ,
  category        VARCHAR(40) NOT NULL DEFAULT 'passenger',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id              SERIAL PRIMARY KEY,
  seller_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(180) NOT NULL,
  kind            VARCHAR(40) NOT NULL DEFAULT 'apartment',
  rooms           INTEGER NOT NULL DEFAULT 1,
  area_m2         INTEGER,
  floor           INTEGER,
  floors          INTEGER,
  price_usd       NUMERIC(12, 2) NOT NULL CHECK (price_usd >= 0),
  location_id     INTEGER REFERENCES locations(id),
  description     TEXT,
  phone           VARCHAR(40),
  status          VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  views           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_images (
  id           SERIAL PRIMARY KEY,
  property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS car_images (
  id          SERIAL PRIMARY KEY,
  car_id      INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ── Favorites ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id      INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, car_id)
);

-- ── Messaging ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          SERIAL PRIMARY KEY,
  buyer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id      INTEGER REFERENCES cars(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, seller_id, car_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id                SERIAL PRIMARY KEY,
  conversation_id   INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notifications ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(40) NOT NULL,
  title       VARCHAR(180) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  related_id  INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  reviewer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id        INTEGER REFERENCES cars(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price_usd);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(is_featured);
CREATE INDEX IF NOT EXISTS idx_cars_created ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_seller ON cars(seller_id);
CREATE INDEX IF NOT EXISTS idx_cars_views ON cars(views DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
