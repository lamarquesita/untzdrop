# CrowdVolt Backend - Build Instructions

You are building the backend for CrowdVolt, a ticket resale marketplace for Peru (like StubHub/SeatGeek but for Lima events). The frontend is already built in Next.js 16 + Tailwind 4 + Supabase + TypeScript.

## Supabase Info
- Project ID: ymtoyhtqvnalqlezadly
- Client is already configured in src/lib/supabase.ts
- Env vars are in .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Existing tables: events, listings, events_with_pricing (view)
- Auth: phone OTP (already working in AuthModal.tsx)

## What to Build

### 1. Supabase SQL (save as supabase-backend.sql)

Create these tables/updates:

**profiles table:**
- id (uuid, references auth.users)
- full_name (text)
- email (text)
- phone (text)
- stripe_customer_id (text, nullable)
- created_at (timestamptz)
- RLS: users can read/update their own profile
- Trigger: auto-create profile on auth.users insert

**Update listings table - add columns:**
- ticket_type (text, default 'ga', check in ('ga', 'vip'))
- ticket_file_path (text, nullable) — path in private storage bucket

**orders table:**
- id (bigint, identity)
- order_number (text, unique) — format: CV-YYYYMMDD-XXX
- listing_id (bigint, references listings)
- buyer_id (uuid, references auth.users)
- seller_id (uuid, references auth.users)
- event_id (bigint, references events)
- ticket_quantity (int)
- ticket_type (text)
- price_per_ticket (numeric)
- service_fee (numeric)
- total_amount (numeric)
- status (text: 'pending', 'paid', 'delivered', 'completed', 'cancelled', 'refunded')
- stripe_payment_intent_id (text, nullable)
- delivery_email (text)
- delivery_phone (text)
- created_at, updated_at (timestamptz)
- RLS: buyers can read their own orders, sellers can read orders for their listings

**offers table:**
- id (bigint, identity)
- event_id (bigint, references events)
- buyer_id (uuid, references auth.users)
- ticket_type (text)
- price_per_ticket (numeric)
- quantity (int)
- status (text: 'active', 'accepted', 'declined', 'expired', 'cancelled')
- stripe_payment_intent_id (text, nullable)
- created_at, expires_at (timestamptz)
- RLS: buyers can read/create their own offers

**Storage:**
- Create policy for a private bucket called "ticket-files" (bucket must be created manually in dashboard)
- Sellers can upload to their own folder: ticket-files/{user_id}/{listing_id}/
- Only the system (service role) or the buyer after order is 'delivered' can read

### 2. API Routes (Next.js App Router: src/app/api/)

**POST /api/checkout**
- Receives: listing_id, quantity, delivery_email, delivery_phone, save_card, payment_method_id (optional for saved cards)
- Creates Stripe PaymentIntent (or uses saved card)
- Creates order with status 'pending'
- Returns: client_secret (for Stripe.js confirmCardPayment)
- If save_card: creates/uses Stripe Customer, attaches payment method

**POST /api/webhook**
- Stripe webhook endpoint
- On payment_intent.succeeded: update order status to 'paid', then to 'delivered' (since we have the ticket file already)
- On payment_intent.payment_failed: update order to 'cancelled'

**POST /api/listings**
- Receives: event_id, price, quantity, ticket_type, ticket_file (multipart)
- Requires auth
- Uploads ticket file to private bucket
- Creates listing row with ticket_file_path
- Returns: listing

**GET /api/orders**
- Requires auth
- Returns user's orders with event info (replaces mockOrders)

**GET /api/sales**
- Requires auth
- Returns user's sales (listings that have been purchased) with order info (replaces mockSales)

**GET /api/ticket/[orderId]**
- Requires auth
- Only returns ticket file URL if order status is 'delivered' or 'completed' AND user is the buyer
- Returns signed URL from private bucket

**POST /api/offers**
- Creates an offer with Stripe auth hold
- Returns client_secret

**POST /api/saved-cards**
- GET: returns user's saved payment methods from Stripe
- DELETE: removes a saved payment method

### 3. Stripe Setup

- Use stripe and @stripe/stripe-js (already installed)
- Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env.local (as placeholder comments)
- Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
- Create src/lib/stripe.ts for server-side Stripe client
- Create src/lib/stripe-client.ts for client-side Stripe.js initialization
- Service fee: 10% of subtotal (calcServiceFee function already exists in supabase.ts, update if needed)

### 4. Frontend Wiring (light touch - just connect existing UI to real APIs)

- Update PurchaseModal.tsx: wire "Completar Compra" button to call /api/checkout, then use Stripe.js confirmCardPayment with the client_secret
- Update SellModal.tsx: wire upload + listing creation to call /api/listings
- Update dashboard/page.tsx: fetch real data from /api/orders and /api/sales instead of mockOrders/mockSales
- Update AuthModal.tsx: save profile data (name, email) to profiles table after registration steps
- Add Stripe.js Elements provider to layout.tsx (just the provider wrapper for tokenization, NOT Stripe UI components)

### Important Notes
- All prices are in PEN (Peruvian Soles), currency code 'PEN' for Stripe
- The QR custody model: seller uploads ticket QR → stored privately → released to buyer after payment
- Don't change the existing UI styling or component structure
- Keep the Spanish copy (all user-facing text in Spanish)
- The existing `calcServiceFee` and `displayPrice` functions in supabase.ts should be the source of truth for fee calculation
- Use createRouteHandlerClient pattern for Supabase in API routes (server-side)
- For Supabase service role operations (accessing private storage), use SUPABASE_SERVICE_ROLE_KEY env var

When completely finished, run this command to notify me:
openclaw system event --text "Done: Built CrowdVolt backend - Supabase tables, Stripe checkout, API routes, frontend wiring" --mode now
