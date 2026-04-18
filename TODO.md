# E-Commerce Project Todo List

## Project Overview

This is a full-stack e-commerce application with:
- **Backend**: NestJS (TypeScript) with PostgreSQL
- **Mobile App**: React Native/Expo with TailwindCSS and Zustand
- **Payment Service**: FastAPI with Midtrans integration
- **Infrastructure**: Docker Compose for local development

**Current Status**: ~70-80% complete. Core features implemented, but authentication integration and some endpoints need finishing.

---

## High Priority Tasks (Blocking)

### 1. ✅ Implement JWT Authentication in Cart Endpoints

**Status**: Not Started
**Files**:
- `ec-be-core/src/cart/cart.controller.ts` (lines 25, 52-53, 86)
- `ec-be-core/src/cart/cart.service.ts` (if exists)

**What's Wrong**:
- Cart endpoints don't properly extract user ID from JWT tokens
- Session typing is incomplete
- Guest cart merge feature can't work without auth

**What Needs to be Done**:
1. **Add proper session typing** (line 25)
   - Define a proper `Session` interface that includes authenticated user context
   - Currently uses generic session type without user info

2. **Extract user from JWT in addToCart** (line 52-53)
   - Use NestJS guards or decorators to get authenticated user from request
   - Pass user ID to cart service instead of getting it from session
   - Ensure cart items are associated with the authenticated user

3. **Extract user from JWT in getCart** (line 86)
   - Retrieve cart only for the authenticated user
   - Validate user ID matches the requested cart owner

4. **Update cart service**
   - Modify service methods to accept user ID parameter
   - Ensure all cart operations are user-scoped

**Why It Matters**:
- Without this, cart data can leak between users
- The guest cart merge feature (task #3) depends on this
- Required for proper checkout flow

**Example of what should happen**:
```typescript
// Before (insecure):
@Post('add')
addToCart(@Body() dto: AddToCartDto) {
  return this.cartService.addItem(dto); // No user context!
}

// After (secure):
@Post('add')
@UseGuards(JwtAuthGuard)
addToCart(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
  return this.cartService.addItem(user.id, dto); // User scoped!
}
```

---

### 2. 🐛 Fix Transaction Status Lookup Bug in Payment Service

**Status**: Not Started
**Files**:
- `ec-payment/src/ec_payment/rest.http` (line 17 - test endpoint)
- `ec-payment/src/ec_payment/` (API implementation)

**What's Wrong**:
- GET `/transaction/{order_id}` endpoint returns 404 when fetching transaction status
- Mobile app and backend can't check payment status
- Order fulfillment can't proceed properly

**What Needs to be Done**:
1. **Investigate the 404 error**
   - Check if transactions are being saved to database
   - Verify order_id parameter is being passed correctly
   - Look for any error handling that might be swallowing exceptions

2. **Verify database query logic**
   - Ensure transaction records are created when payments are initiated
   - Check the query uses correct field names (order_id vs transaction_id)
   - Verify foreign key relationships are correct

3. **Debug Midtrans integration**
   - Verify Midtrans transaction IDs are stored correctly
   - Check if we're querying by the right identifier

4. **Test the endpoint**
   - Use valid order IDs from the database
   - Verify response includes transaction status, amount, and Midtrans details

**Why It Matters**:
- Users need to see payment status after checkout
- Backend needs to reconcile order status with payment status
- Payment webhooks depend on this working

**How It Should Work**:
```
User completes checkout → Payment created in payment service
Mobile asks: GET /transaction/{order_id}
Payment service returns: { status: "pending", amount: 50000, midtrans_id: "..." }
```

---

## Medium Priority Tasks

### 3. 🔄 Implement Guest Cart Merge Functionality

**Status**: Not Started (Blocked by Task #1)
**Files**:
- `ec-be-core/src/cart/cart.controller.ts` (line 83)
- `ec-be-core/src/cart/cart.service.ts`

**What's Wrong**:
- Currently has a placeholder comment: "This will be implemented when authentication is added"
- When a guest user (no JWT) logs in, their cart items are lost

**What Needs to be Done**:
1. **Identify guest vs authenticated users**
   - Guest users probably have session ID or guest token
   - Authenticated users have JWT in Authorization header

2. **Create a cart merge service method**
   ```typescript
   mergeGuestCartToUser(guestId: string, userId: string)
   ```

3. **Merge logic**
   - Get guest cart items
   - Get user's existing cart items
   - Combine items:
     - If same product exists in both: keep highest quantity or sum them (decide based on UX)
     - Add unique items from guest cart to user cart

4. **Execute merge on login**
   - After user authentication succeeds, call merge function
   - Clear guest cart data
   - Redirect to cart view so user sees merged items

**Why It Matters**:
- Guest users can add items without account
- When they sign up, they don't want to lose their items
- Improves user experience and conversion rate

**Example Flow**:
```
1. Guest adds 2x Product A to cart → stored with session_id="abc123"
2. Guest signs up → gets JWT token
3. Login endpoint calls: mergeGuestCartToUser("abc123", "user_id_456")
4. Result: User's cart now has 2x Product A
```

---

### 4. 📱 Add Pagination and Filtering to Mobile Orders Screen

**Status**: Not Started
**Files**:
- `ec-mobile/src/screens/orders-screen.tsx` (line 18)

**What's Wrong**:
- Orders screen shows all orders without pagination or filtering
- If user has 100+ orders, page becomes slow and hard to use
- No way to find orders by date or status

**What Needs to be Done**:
1. **Add pagination**
   - Implement "Load More" button or page navigation
   - Default to 10-20 orders per page
   - Track current page in Zustand state

2. **Add status filter**
   - Filter buttons: "All", "Pending", "Completed", "Cancelled", etc.
   - Track selected filter in state

3. **Add date range filter**
   - Optional: date pickers for "from" and "to" dates
   - Or simple options: "Last 7 days", "Last 30 days", "All time"

4. **Integrate with React Query**
   - Update API query to include pagination params: `page`, `limit`
   - Include filter params: `status`, `dateFrom`, `dateTo`
   - Use React Query's `useInfiniteQuery` or `useQuery` with refetch

5. **Update backend endpoint** (if needed)
   - Ensure GET `/orders` endpoint accepts pagination parameters
   - Implement sorting (newest first by default)
   - Return total count for pagination info

**Why It Matters**:
- Large order histories will make app slow/unresponsive
- Users need to find specific orders easily
- Better UX and performance

**Example Implementation**:
```typescript
// Before:
const { data: orders } = useQuery(() => api.getOrders());

// After:
const [status, setStatus] = useState('all');
const [page, setPage] = useState(1);
const { data: orders } = useQuery(
  ['orders', status, page],
  () => api.getOrders({ status, page, limit: 10 })
);
```

---

### 5. 🔄 Implement Order Status Management in Backend

**Status**: Not Started
**Files**:
- `ec-be-core/src/order/` (order module)
- Database migration files
- Design notes: `ec-be-core/notes`

**What's Wrong**:
- Order statuses aren't properly managed
- No way to track order progression through fulfillment
- Payment status and order status might be out of sync

**What Needs to be Done**:
1. **Define order status states**
   - `PENDING` - Order created, awaiting payment
   - `PROCESSING` - Payment confirmed, preparing to ship
   - `COMPLETED` - Order shipped/delivered
   - `CANCELLED` - Order cancelled by user or system
   - `FAILED` - Payment failed, refunded

2. **Create status update endpoint**
   ```
   PATCH /orders/{id}/status
   Body: { status: "PROCESSING" }
   ```

3. **Webhook integration**
   - Listen for payment status changes from payment service
   - Automatically update order status when payment succeeds/fails
   - Only payment service should change status from PENDING

4. **Add database constraints**
   - Prevent invalid status transitions
   - Log status change history for auditing
   - Add timestamp for each status change

5. **Update order response**
   - Include current status in all order endpoints
   - Include status history if available
   - Include estimated delivery date based on status

**Why It Matters**:
- Users need to know what's happening with their orders
- Mobile app needs accurate status to show in order history
- Required for proper order fulfillment workflow

**Status Flow**:
```
PENDING (awaiting payment)
  ↓
  ├→ FAILED (payment rejected)
  │
  └→ PROCESSING (payment confirmed)
      ↓
      ├→ COMPLETED (shipped)
      │
      └→ CANCELLED (before processing)
```

---

## Low Priority Tasks (Polish)

### 6. 📚 Update Backend Documentation

**Status**: Not Started
**Files**:
- `ec-be-core/README.md`

**What's Wrong**:
- Contains generic NestJS boilerplate information
- No project-specific details
- Doesn't explain the e-commerce features

**What Needs to be Done**:
1. **Project Overview**
   - What this backend does (e-commerce platform)
   - Key features
   - Technology stack

2. **Architecture Overview**
   - Module structure (auth, users, products, cart, orders, payments)
   - Database schema overview
   - External integrations (Midtrans, payment service)

3. **API Documentation**
   - List main endpoints by module
   - Authentication requirements
   - Key request/response formats
   - Error codes and meanings

4. **Setup Instructions**
   - Environment variables needed
   - Database setup
   - Running with Docker
   - Running locally

5. **Development Guide**
   - How to add new endpoints
   - Database migrations
   - Testing
   - Payment integration details

**Why It Matters**:
- Makes project easier for new developers to understand
- Reduces time to onboard team members
- Good reference for maintenance

---

### 7. 🗑️ Remove Payment Entity from Backend and Use Payment Service

**Status**: Not Started
**Files**:
- `ec-be-core/src/payment/` (payment module - to be removed)
- `ec-be-core/src/order/` (order module - to be updated)

**What's Wrong**:
- Backend has its own payment module, but there's a dedicated payment service
- This creates duplicate logic and inconsistency
- Orders and payments are tightly coupled when they should be separate

**What Needs to be Done**:
1. **Identify current payment module**
   - Find payment entity, controller, service
   - List all payment-related endpoints
   - Check what payment logic exists

2. **Identify dependencies**
   - What endpoints currently use payment module
   - What other modules depend on it

3. **Migrate to payment service**
   - Instead of saving payments in BE database, call payment service
   - Keep only order coordination logic in backend
   - Example:
     ```typescript
     // Before: Backend handles payment
     const payment = await paymentService.createPayment(order);
     order.paymentId = payment.id;

     // After: Payment service handles payment
     const payment = await httpClient.post('/payment/create-payment', { orderId });
     order.paymentId = payment.id;
     ```

4. **Update order endpoints**
   - Checkout now calls payment service instead of payment module
   - Order status updates based on payment service webhooks

5. **Remove payment module**
   - Delete `ec-be-core/src/payment/` directory
   - Remove from app.module.ts imports
   - Update tests

6. **Test payment flow**
   - Create order
   - Call payment service
   - Verify webhook updates order status

**Why It Matters**:
- Cleaner separation of concerns
- Payment logic is centralized in payment service
- Easier to scale or switch payment providers
- Reduces code duplication

**Architecture After**:
```
Mobile App → Backend (orders) → Payment Service (payments)
                ↑                      ↓
                └─── Webhooks ────────┘
```

---

## Quick Reference

### File Locations
```
ec-be-core/                    (NestJS Backend)
├── src/
│   ├── cart/                  (Task #1)
│   ├── order/                 (Task #5, #7)
│   ├── payment/               (Task #7)
│   ├── auth/                  (Needed for Task #1)
│   └── notes                  (Design documentation)
├── README.md                  (Task #6)
└── docker-compose.yaml        (Infrastructure)

ec-mobile/                     (React Native App)
└── src/screens/
    └── orders-screen.tsx      (Task #4)

ec-payment/                    (FastAPI Payment Service)
├── src/ec_payment/
│   └── rest.http              (Task #2)
└── README.md                  (Already well documented)
```

### Dependency Order
```
Task #1 ──┐
          ├→ Task #3 (guest cart merge)
          │
Task #2 ──┤
          ├→ Task #5 (order status)
          │
Task #4 (independent)

Task #6 (independent documentation)

Task #7 (can be done anytime, depends on understanding #1)
```

### Recommended Starting Order
1. **Task #1** - Cart authentication (fixes security issue)
2. **Task #2** - Payment transaction bug (fixes critical feature)
3. **Task #3** - Guest cart merge (improves UX, depends on #1)
4. **Task #5** - Order status (improves tracking)
5. **Task #4** - Mobile pagination (improves performance)
6. **Task #6** - Documentation (improves maintainability)
7. **Task #7** - Remove duplicate payment logic (refactoring)

---

## Getting Started

To start working on tasks, you can:
- Use `/list` to see all tasks
- Pick a task from the priority list above
- Ask me to help with any specific task

Good luck! The project is close to completion. Focus on the high-priority items first—they unlock other features.
