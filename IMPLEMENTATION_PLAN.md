# Niraa Implementation Plan - Live Progress Tracker

Last updated: 2026-04-21

## Current Direction
- Data layer strategy: Firebase fallback enabled for user/auth flows.
- Runtime objective: production-ready customer/admin operations with realtime visibility and stable auth.
- Priority now: stabilize core commerce + admin operations before advanced integrations.

## Completed Tasks

### Authentication and Profile
- [x] OTP send/verify flow implemented and running.
- [x] Password login flow implemented.
- [x] Profile update save issue fixed on frontend (`/api/auth/profile` path alignment).
- [x] Token handling standardized in key admin pages (`niraa_token` source).
- [x] JWT token now includes `role` claim to support admin authorization checks.

### Admin Access and Customers Module
- [x] Admin route gating issue fixed so admin pages can open with intended flow.
- [x] Admin customers page now shows:
  - [x] Total Registered Customers
  - [x] Customers Ordered Today
  - [x] Active Customers (last 30 days)
- [x] Customers page now includes registered users with zero orders.
- [x] Customers page now supports:
  - [x] Search (name/phone/email)
  - [x] Activity filters (today / 7d / 30d / no-orders)
  - [x] CSV export
- [x] Realtime push updates added for admin customers/orders refresh via WebSocket.

### Data Storage Migration Progress
- [x] Excel runtime dependency removed from auth and user controllers.
- [x] Firebase storage utility added for user CRUD operations.
- [x] OTP storage decoupled from Excel into dedicated in-memory module.
- [x] Firebase migration script command added (`npm run migrate:firebase`).

## In Progress
- [ ] Validate end-to-end Firebase runtime across all core modules in one smoke test pass.
- [ ] Ensure admin dashboard stats behave consistently when Firebase fallback is active.

## Pending High-Priority Tasks

### Orders and Customer History Consistency
- [ ] Add authenticated "my orders" endpoint compatible with current `ProfileOrders` page expectations.
- [ ] Align order model/data source strategy for Firebase fallback paths.
- [ ] Add robust empty/error states for order and customer dashboards.

### Admin and Analytics Hardening
- [ ] Consolidate duplicate admin implementations (`AdminPages` variants) into one stable route flow.
- [ ] Normalize dashboard metrics labels vs backend status values (`pending`, `placed`, etc.).
- [ ] Add server-side pagination/search support to customers UI for large datasets.

### Payments and Location
- [ ] Replace mock payment controller responses with live Razorpay test integration.
- [ ] Replace mock location suggestions/reverse geocode with Google Maps APIs.

### Production Readiness
- [ ] Add central API service with consistent auth header injection and retry handling.
- [ ] Add structured logging + error monitoring (Sentry or equivalent).
- [ ] Add deployment profile and environment validation checklist.
- [ ] Add baseline automated tests (auth, profile save, admin customers metrics, order status update).

## Pending Medium-Priority Tasks
- [ ] Notification system (email and optional SMS updates).
- [ ] Advanced admin exports and scheduled reports.
- [ ] Performance tuning and caching for dashboard-heavy endpoints.

## Execution Checklist (Next)
1. Run backend dependency install for WebSocket package and restart server.
2. Run Firebase migration and verify user counts between source and target.
3. Smoke test critical flows:
   - customer signup/login/profile save
   - admin login + customers + orders
   - customer metrics realtime refresh
4. Resolve remaining endpoint/data mismatches for orders history.

## Notes
- This file is now the source of truth for what is done vs pending.
- Legacy long-form planning notes can be retained for reference, but delivery should track against this checklist.

---

I have created a comprehensive implementation plan document (`IMPLEMENTATION_PLAN.md`) that serves as your complete roadmap for the Niraa project.

## 📋 What's Included:

**1. Executive Summary**
- Current project status (what's done, what's missing)
- Stage 2 milestone reached

**2. System Architecture**
- Visual diagram showing React frontend → Express backend → MongoDB/APIs
- Clear data flow visualization

**3. Complete 9-Phase Implementation Plan**
- **Phase 1**: Backend API Foundation (30+ endpoints)
- **Phase 2**: Authentication & OTP System
- **Phase 3**: Database Migration (Excel → MongoDB)
- **Phase 4**: Booking System
- **Phase 5**: Location Services (Google Maps)
- **Phase 6**: Payment Integration (Razorpay)
- **Phase 7**: Admin Dashboard
- **Phase 8**: Notifications System
- **Phase 9**: Production Deployment

**4. Actionable Details for Each Phase**
- Specific tasks with checkboxes
- Required API routes
- Frontend components to build
- Technology setup instructions

**5. Complete Reference Materials**
- Full file structure recommendations
- 30+ API endpoint specifications
- .env configuration template
- Success metrics for each phase

**6. Priority Breakdown**
- High Priority (This Week): Phase 1 & 2
- Medium Priority (Weeks 3-6): Phase 3-7
- Low Priority (Weeks 7+): Phase 8-9

## 🎯 Immediate Next Steps (This Week):

1. **Phase 1**: Complete all backend API routes
   - Fix signup/login endpoints
   - Add missing routes (user, location, payment, orders)

2. **Phase 2**: Implement Firebase OTP authentication
   - Create Firebase project
   - Add OTP verification flow
   - Update frontend auth pages

3. **Phase 3**: Setup MongoDB Atlas
   - Create free cluster
   - Design schemas
   - Migrate Excel data

The document is saved and ready to guide development one phase at a time. Use it to track progress and stay focused on one milestone at a time.