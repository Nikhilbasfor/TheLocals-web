# THE LOCALS - Web Application

A 1:1 responsive web companion for **THE LOCALS** (Himalayan Guide & Discovery Network), built with **React 18 + Vite + Tailwind CSS** and connected directly to the same **Firebase** (`yatraki`) backend and **Razorpay** checkout system as the Android & iOS Flutter mobile apps.

---

## 🏔 Features & Flow Overview

### 1. Unified Authentication & Role Selection
* **Cinematic Portal Chooser (`/`):** High-res scenic Ken Burns animated backdrop with glassmorphism cards for *Explorers* and *Local Hosts*.
* **Role-Aware Auth (`/login`, `/signup`):** Email & Password login/signup synced to Firestore collection `/users/{uid}`.
* **Role Guards:** Context-driven route protection ensuring guides access host features and travellers access booking management.

### 2. Explorer / Traveller Experience
* **Discovery Feed (`/explore`):** Real-time Firestore stream from `/experiences`, live search by valley/state/trail, filter by category and max budget.
* **Expedition Detail (`/experience/:id`):**
  * Full photography gallery with thumbnail strip.
  * Native host credentials & badge.
  * Day-by-Day multi-day itinerary accordion (`ItineraryDay` & `TimelineItem`).
  * Expedition waypoints & route pins with direct Google Maps navigation links.
  * Inclusions, Exclusions, and Packing checklist.
  * Verified traveler reviews stream & review submission.
* **Booking & Checkout Modal:**
  * Real-time price and guest count calculation.
  * Creates pending reservation in Firestore `/bookings`.
  * Triggers **Razorpay Web Checkout** (`#13352B` brand theme).
  * On success, marks reservation as `paid` and `confirmed`.
* **My Expeditions (`/bookings`):** Active, confirmed, pending, completed, and cancelled bookings with cancellation controls.
* **Wishlist (`/wishlist`):** Saved itineraries synced live to `/wishlists`.
* **Profile (`/profile`):** Edit profile details, avatar upload to Firebase Storage, and switch to Host portal.

### 3. Local Host / Guide Portal
* **Guide Onboarding & KYC (`/guide/onboarding`):**
  * 5-step registration: Personal info, guiding experience & specialties, Aadhaar front & back photo upload to Firebase Storage, native roots & story.
  * Verification-pending review status screen.
* **Host Dashboard (`/guide/dashboard`):**
  * Real-time metrics: Active expeditions, total reservations, total earnings, host rating.
  * Expeditions catalog with quick status toggle (Active / Draft) and edit link.
* **Itinerary Studio (`/guide/create-experience`, `/guide/edit-experience/:id`):**
  * Overview & pitch editor.
  * Cover image and gallery photo uploader (Firebase Storage).
  * Day-by-day itinerary builder (Accommodation, meals, transport info, schedule items).
  * Waypoint & route pin manager (Start, stop, overnight camp, highlight, end pin).
  * Inclusions, exclusions, and packing list.
* **Reservation Manager (`/guide/bookings`):** View incoming bookings with traveler contact info, accept/decline, or mark completed.
* **Host Profile (`/guide/profile`):** Public credentials, verification badges, and bio editor.

---

## 🛠 Tech Stack

* **Frontend:** React 18, React Router v6, Lucide Icons, Tailwind CSS
* **Backend:** Firebase Modular SDK v10 (Firestore, Firebase Auth, Firebase Storage)
* **Payments:** Razorpay Web SDK
* **Build Tool:** Vite 5

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
