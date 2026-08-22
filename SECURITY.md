# Security Policy & Implementation Overview — Mini D-Mart

This document outlines the security controls and protection measures implemented across the Mini D-Mart application.

---

## 1. Authentication & Session Security

- **Password Hashing**: User passwords are never stored in plain text. Passwords are hashed using `bcryptjs` with 10 salt rounds before database persistence.
- **JWT Protection**: Authentication relies on signed JSON Web Tokens (JWT). Tokens expire in 7 days and are transmitted via HTTP `Authorization: Bearer <token>` headers.
- **Credential Protection**: Database passwords and secrets are loaded from environment variables (`.env`). Secrets are excluded from version control via `.gitignore`.

---

## 2. Authorization & Role-Based Access Control (RBAC)

- **Middleware Enforcement**: Both frontend routes (`ProtectedRoute.jsx`) and backend APIs (`protect` & `authorize` middleware) enforce strict RBAC across `customer`, `staff`, and `admin` roles.
- **Resource Ownership Verification**: Customers are strictly restricted from accessing or cancelling other users' orders (`order.userId === req.user._id`).
- **Administrative Privileges**: Sensitive operations such as user role updates (`PATCH /api/users/:id/role`) are strictly restricted to verified Admin accounts. Self-demotion by a sole admin is prevented.

---

## 3. Data Integrity & Business Logic Security

- **Server-Side Validation**: Product prices, order subtotals, inventory stock levels, and daily store pickup limits are verified and calculated **strictly on the backend**. Frontend calculations are never trusted.
- **Atomic Inventory Updates**: Product stock adjustments use Mongoose atomic operators (`$inc`) to prevent race conditions during concurrent checkouts or order cancellations.
- **Daily Capacity Enforcement**: Store pickup orders are constrained to a maximum of 10 orders per day to prevent system abuse and store overloading.
- **7-Day Return Eligibility**: Return and exchange requests validate order delivery state and enforce a 7-day cutoff window based on server timestamps.

---

## 4. Audit Logging

- **Action Auditing**: Critical administrative and transactional actions (user role modifications, order state transitions, return approvals/rejections, catalog updates) generate structured audit log entries (`middleware/auditLogger.js`) capturing timestamp, action name, user ID, user role, and event details.

---

## 5. Security Recommendations for Production Deployment

1. **HTTPS Enforcement**: Deploy frontend and backend over TLS/SSL (HTTPS) in production.
2. **HttpOnly Cookies**: For web browser clients, consider storing JWT tokens in `HttpOnly`, `SameSite=Strict`, `Secure` cookies to mitigate XSS risks.
3. **Rate Limiting**: Implement `express-rate-limit` on `/api/auth/login` and `/api/auth/register` to prevent brute-force attacks.
4. **CORS Configuration**: Restrict backend CORS `origin` header strictly to the deployed domain rather than wildcard `*`.
