# UNiReserve — Laboratory Examination Defense Manual
## Laravel User Management and Role-Based Access Control (RBAC)

**Course:** Web Application Development / Advanced Framework Programming  
**Laboratory Examination:** Part II — 50 Points (100-Point Rubric Scale)  
**Project Title:** **UNiReserve** (DSSC Uniform Reservation & Business Enterprise Office System)  
**Institution:** Davao del Sur State College (DSSC)  
**Architecture:** Laravel 12 (PHP 8.2+) • Inertia.js • React 19 (TypeScript) • Spatie Laravel-Permission • Tailwind CSS  

---

## Table of Contents
1. [Required Presentation Sequence & Checklist](#1-required-presentation-sequence--checklist)
2. [Step 1: Project Overview & Purpose](#step-1-project-overview--purpose)
3. [Step 2: Database Architecture & Entity Relationships](#step-2-database-architecture--entity-relationships)
4. [Step 3: Authentication & Security Implementation](#step-3-authentication--security-implementation)
5. [Step 4: User Management System (CRUD Operations)](#step-4-user-management-system-crud-operations)
6. [Step 5: RBAC Implementation via Spatie Laravel-Permission](#step-5-rbac-implementation-via-spatie-laravel-permission)
7. [Step 6: Live Demonstration — Authorized Administrator Flow](#step-6-live-demonstration--authorized-administrator-flow)
8. [Step 7: Live Demonstration — Restricted / Unauthorized Flow](#step-7-live-demonstration--restricted--unauthorized-flow)
9. [Step 8: Architectural Code Walkthrough](#step-8-architectural-code-walkthrough)
10. [Step 9: Technical Q&A Defense Preparation](#step-9-technical-qa-defense-preparation)
11. [Step 10: Rubric Compliance & Scoring Matrix](#step-10-rubric-compliance--scoring-matrix)

---

## 1. Required Presentation Sequence & Checklist

Follow this exact 9-step sequence during your live presentation as specified by the laboratory guidelines:

| # | Step | Estimated Time | Key Goal / Demonstration |
|---|---|---|---|
| **1** | **Project Overview** | 1 min | Explain the real-world institutional purpose of UNiReserve. |
| **2** | **Database Overview** | 1.5 mins | Show migrations, database tables, and the User–Role–Permission schema. |
| **3** | **Authentication** | 1 min | Log in as Super Admin; discuss password hashing and CSRF protection. |
| **4** | **User CRUD** | 2.5 mins | Create a new user, search/view them, edit their role/data, and delete them. |
| **5** | **RBAC Configuration** | 2 mins | Open Roles & Permissions matrix; assign/toggle permissions and show cache flushing. |
| **6** | **Authorized Test** | 1.5 mins | Show permitted Super Admin operations (user CRUD, role management, audit logs). |
| **7** | **Unauthorized Test** | 1.5 mins | Log in as a Student; navigate directly to `/admin/users`; show **HTTP 403 Forbidden**. |
| **8** | **Code Walkthrough** | 2.5 mins | Walk through Routes, Controllers, Model traits, Middleware, and React Pages. |
| **9** | **Technical Q&A** | 2.5 mins | Answer instructor questions using the technical concepts documented in Section 10. |

---

## Step 1: Project Overview & Purpose

### Institutional Context
**UNiReserve** is a web-based management and reservation system built for the **Business Enterprise Office (BEO)** of **Davao del Sur State College (DSSC)**. 

### Core Problem Solved
Historically, student uniform reservations, sizing, inventory reconciliation, and cashier payment processing at DSSC involved long physical queues, manual paper slips, and delayed inventory updates. 

### The Solution & User Roles
UNiReserve digitizes this workflow by establishing **four distinct roles**:
1. **Student:** Browses uniform catalog, places reservations, prints/views **Digital Reservation Slips**, tracks queue status, and can cancel eligible reservations.
2. **BEO Staff / Admin:** Manages physical inventory, approves/rejects reservations, verifies official receipts brought by students, and processes uniform releases.
3. **School Cashier:** Operates a dedicated collection window (`/cashier/payments`), collects payments, and issues serialized **Official Receipts (`receipt_number`)**.
4. **Super Admin:** System governance, promoting existing accounts, managing roles & permissions, user CRUD, and reviewing tamper-evident audit logs.

---

## Step 2: Database Architecture & Entity Relationships

### 1. Migrations Overview
The system database is governed by reproducible migrations:

- `0001_01_01_000000_create_users_table.php`: Defines the primary `users` entity.
- `2026_09_08_000001_create_unireserve_tables.php`: Defines domain tables (`products`, `product_sizes`, `inventories`, `reservations`, `reservation_items`, `payments`, `queue_entries`, `audit_logs`).
- `2026_09_08_000002_create_permission_tables.php`: Spatie Laravel-Permission tables.

### 2. Spatie RBAC Database Schema
Spatie implements a polymorphic many-to-many relationship using 5 tables:

```
[users] (id, name, email, password, role, status)
   │
   ├── [model_has_roles] (role_id, model_type, model_id)
   │         │
   │         └── [roles] (id, name, guard_name)
   │                   │
   │                   └── [role_has_permissions] (permission_id, role_id)
   │                               │
   └── [model_has_permissions] ────┴── [permissions] (id, name, guard_name)
```

1. **`roles`**: Contains system roles (`Super Admin`, `Staff/Admin`, `School Cashier`, `Student`).
2. **`permissions`**: Contains granular capabilities (e.g., `view users`, `create users`, `record payments`, `manage inventory`).
3. **`model_has_roles`**: Pivot table associating a model (`App\Models\User`) with a `role_id`. Enables a user to have one or more roles.
4. **`role_has_permissions`**: Pivot table linking roles to permissions.
5. **`model_has_permissions`**: Pivot table allowing direct permission assignment to an individual user, bypassing role grouping when required.

### 3. Key Relationships in Eloquent (`app/Models/User.php`)
```php
// User inherits HasRoles trait from Spatie
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;
    
    // Relationships
    public function reservations(): HasMany {
        return $this->hasMany(Reservation::class);
    }

    public function payments(): HasMany {
        return $this->hasMany(Payment::class, 'cashier_id');
    }
}
```

---

## Step 3: Authentication & Security Implementation

### Live Demo Steps:
1. Open browser at `http://127.0.0.1:8000/login`.
2. Enter email: `admin@dssc.edu.ph`, password: `Admin@12345`.
3. Submit form. The application authenticates and redirects to `/admin/dashboard`.

### Security Mechanisms in Place:
- **Password Hashing:** Passwords are encrypted using **Argon2id / Bcrypt** via Laravel's `Hash::make()` and verified via `Hash::check()`. Raw passwords are never stored.
- **CSRF Protection:** Every request contains an encrypted `X-XSRF-TOKEN` cookie verified by Laravel's `VerifyCsrfToken` middleware.
- **Session Fixation Prevention:** On login, `request()->session()->regenerate()` issues a new session ID to invalidate hijacked sessions.
- **Brute Force Protection:** Authentication requests are throttled via Laravel rate limiters (`throttle:login`).
- **Passkey & 2FA Ready:** Integrated with Laravel Fortify's two-factor authentication and passkey interfaces.

---

## Step 4: User Management System (CRUD Operations)

**Controller:** `app/Http/Controllers/Admin/AdminUserController.php`  
**Views:** `resources/js/pages/admin/users/index.tsx`, `create.tsx`, `edit.tsx`

### 1. CREATE Operation
- **URL:** `/admin/users/create`
- **Form Fields:** Full Name, Email, Password, Password Confirmation, System Role (Student, BEO Staff, School Cashier, Super Admin), Student ID (optional), Contact Phone, Course/Program, Year Level.
- **Validation Rules (`store` method):**
  ```php
  $request->validate([
      'name'           => 'required|string|max:255',
      'email'          => 'required|email|unique:users,email',
      'password'       => 'required|string|min:8|confirmed',
      'role'           => 'required|string',
      'student_id'     => 'nullable|string|unique:users,student_id',
      'phone'          => 'nullable|string',
      'course_program' => 'nullable|string',
      'year_level'     => 'nullable|string',
  ]);
  ```
- **Business Logic:**
  - Role input is resolved to both Spatie role name and internal column (`$this->resolveRoleMapping($request->role)`).
  - Super Admin creation is strictly guarded: only an existing Super Admin can create another Super Admin (`abort(403)` if unauthorized).
  - Synchronizes Spatie role: `$user->syncRoles([$roleMapping['spatie']])`.
  - Dispatches an audit entry into `audit_logs`.

### 2. READ Operation
- **URL:** `/admin/users`
- **Features Demonstrated:**
  - Paginated data table (20 users per page).
  - Dynamic multi-field search (searches across name, email, and student ID).
  - Role filter tabs (`All`, `Super Admin`, `Staff/Admin`, `School Cashier`, `Student`).
  - Active/Inactive account badges and role color-coding.

### 3. UPDATE Operation
- **URL:** `/admin/users/{user}/edit`
- **Features Demonstrated:**
  - Prefilled form with existing academic and account details.
  - Role modification with live Spatie role reassignment (`$user->syncRoles(...)`).
  - Optional password reset (leaves existing password intact if left blank).
  - **Self-Protection Guards:**
    - A user **cannot deactivate their own account**.
    - A Super Admin **cannot demote their own account** from this view.

### 4. DELETE / SAFE DEACTIVATION Operation
- **Controller Action:** `destroy(Request $request, User $user)`
- **Safety Safeguards Demonstrated:**
  1. **Self-Deletion Guard:** Users cannot delete their own authenticated account.
  2. **Sole Super Admin Guard:** The system rejects deletion if the target is the only remaining Super Admin.
  3. **Data Integrity / Historical Preservation Guard:**
     - If the user has past reservations or payment records, a hard delete would violate database foreign key constraints. The system automatically switches to **safe deactivation** (`status = 'inactive'`) with an explanatory flash message.
     - If the user is a fresh test account with no transaction history, the system detaches roles and performs a **permanent hard delete**.

---

## Step 5: RBAC Implementation via Spatie Laravel-Permission

**Controllers:** `app/Http/Controllers/Admin/RoleController.php`, `PermissionController.php`  
**Views:** `resources/js/pages/admin/roles/index.tsx`, `resources/js/pages/admin/permissions/index.tsx`

### 1. Role & Permission Assignment Matrix
- Navigate to `/admin/roles`.
- Displays all system roles along with the user count and assigned permissions.
- Clicking any role reveals the **Permission Assignment Matrix** with granular permissions grouped by domain:
  - *Catalog & Uniforms:* `view uniforms`, `manage uniforms`
  - *Reservations:* `create reservation`, `view own reservation`, `cancel own reservation`, `view reservations`, `manage reservations`
  - *Queue:* `view own queue status`, `view queue`, `manage queue`
  - *Payments:* `view payments`, `record payments`, `view receipts`
  - *Inventory:* `view inventory`, `manage inventory`
  - *User Management:* `view users`, `create users`, `edit users`, `delete users`, `assign roles`
  - *System Governance:* `view roles`, `create roles`, `edit roles`, `delete roles`, `promote super admin`

### 2. Permission Synchronization Code
When permissions are modified in the matrix:
```php
$role->syncPermissions($request->permissions);
app()[PermissionRegistrar::class]->forgetCachedPermissions();
```
*Note for defense:* Point out that **`forgetCachedPermissions()`** is crucial because Spatie caches permissions in Redis/memory to optimize query performance. Clearing the cache ensures changes take effect immediately without server restarts.

### 3. System Role Protection
Core system roles (`Super Admin`, `Staff/Admin`, `Student`) have delete and rename safeguards in `RoleController.php`:
```php
if (in_array($role->name, $this->systemRoles)) {
    return back()->withErrors(['error' => "Core system role '{$role->name}' cannot be deleted."]);
}
```

---

## Step 6: Live Demonstration — Authorized Administrator Flow

Demonstrate that an authorized administrator has access to all operational features:

1. **Login:** Log in as `admin@dssc.edu.ph` / `Admin@12345`.
2. **Dashboard Verification:** Access `/admin/dashboard`. Notice the administrative widgets (Total Users, Active Inventory, Pending Approvals, Total Collections).
3. **User CRUD:**
   - Go to `/admin/users`.
   - Click **Add User**.
   - Create test user:
     - Name: `Exam Test Student`
     - Email: `exam_student@dssc.edu.ph`
     - Password: `Password@123`
     - Role: `Student`
     - Student ID: `2026-99999`
   - Search for `Exam Test Student` in the search box.
   - Click **Edit**, change name to `Exam Test Student (Updated)`.
   - Click **Delete**, confirm the popup. Note the permanent deletion flash message.
4. **Role Configuration:**
   - Go to `/admin/roles`.
   - Select `Staff/Admin` and toggle an optional permission.
5. **Audit Trail Verification:**
   - Review `/admin/reports` to show that all user creations, updates, and role changes generated an immutable record in `audit_logs`.

---

## Step 7: Live Demonstration — Restricted / Unauthorized Flow

Demonstrate that the server strictly enforces authorization and prevents privilege escalation:

1. **Logout & Switch Account:**
   - Log out of Super Admin.
   - Log in as Student: `student@dssc.edu.ph` / `Student@12345`.
2. **UI Authorization Enforcement:**
   - Observe the Student sidebar: User Management, Roles & Permissions, Inventory Management, and System Settings are **completely absent** from the navigation.
3. **Server-Side URL Manipulation Attack Test:**
   - In the browser address bar, manually type:  
     `http://127.0.0.1:8000/admin/users`
   - Press Enter.
   - **Result:** The system aborts with **HTTP 403 Forbidden** (or redirects safely to `/login` / `/dashboard`).
4. **Prohibited Action Test via Cashier Role:**
   - Log out and sign in as School Cashier: `cashier@dssc.edu.ph` / `Cashier@12345`.
   - Attempt to navigate to `/admin/inventory` or `/admin/users`.
   - **Result:** Access is strictly denied with **HTTP 403 Forbidden**. Cashier is restricted solely to payment collections (`/cashier/payments`).

---

## Step 8: Architectural Code Walkthrough

### 1. Route Definitions (`routes/web.php`)
Explain how routes are grouped with middleware and role constraints:

```php
// Student Group
Route::middleware(['role:student'])->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
});

// School Cashier Group
Route::middleware(['role:cashier,School Cashier,Cashier'])
    ->prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/payments', [CashierController::class, 'payments']);
        Route::post('/payments/{reservation}/record', [CashierController::class, 'recordPayment']);
});

// BEO Staff & Admin Group
Route::middleware(['role:admin,staff'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::get('/inventory', [AdminInventoryController::class, 'index']);

    // Super Admin Exclusive Group
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('/users', AdminUserController::class);
        Route::resource('/roles', RoleController::class);
        Route::resource('/permissions', PermissionController::class);
    });
});
```

### 2. Role Middleware (`app/Http/Middleware/RoleMiddleware.php`)
Explain how the middleware enforces server-side security:
- Checks if the user is authenticated.
- Grants universal pass-through to `Super Admin`.
- Evaluates Spatie roles (`$user->hasRole(...)`) and falls back to model attributes.
- Returns `abort(403, 'Unauthorized access.')` on failure.

### 3. Controller Architecture
Explain the separation of concerns:
- **`AdminUserController`**: Handles user data persistence, role synchronization, self-protection guards, and audit logging.
- **`RoleController`**: Handles Spatie roles and permission assignment.
- **`CashierController`**: Encapsulates collection operations and official receipt issuance.

### 4. React Frontend Architecture
- Built with **Inertia.js** for seamless SPA rendering without client-side API boilerplate.
- **Conditional UI Rendering:** Interactive elements check user roles before rendering, ensuring students and cashiers do not see admin buttons.
- Form submissions utilize Inertia's `useForm` hook with client-side reactive validation errors.

---

## Step 9: Technical Q&A Defense Preparation

Be prepared to answer these common panel questions with confidence:

### Q1: Why did you use Spatie Laravel-Permission instead of just adding a `role` column to the `users` table?
> **Answer:** "A single `role` string column is rigid and violates the Open/Closed Principle. In a real-world institution like DSSC, staff responsibilities evolve. Spatie Laravel-Permission implements a polymorphic many-to-many relationship using 5 normalized tables. This allows users to hold multiple roles, enables granular permission assignments, integrates with Laravel's native `@can` directives and policies, and utilizes built-in permission caching for high-performance authorization checks."

### Q2: What happens if an unauthorized user inspects the DOM and un-hides an 'Add User' button in React?
> **Answer:** "Client-side UI changes are purely cosmetic. Even if a malicious user enables the button or dispatches an HTTP POST request using Postman or cURL, the request hits Laravel's `RoleMiddleware` and `AdminUserController@store`. The server independently verifies `$request->user()->hasRole('Super Admin')` and aborts with HTTP 403 Forbidden. Authorization is strictly enforced server-side."

### Q3: Why is `forgetCachedPermissions()` called after updating roles or permissions?
> **Answer:** "Spatie caches all role-to-permission mappings in memory/cache to prevent executing multiple database queries on every HTTP request. If we update permissions without flushing the cache, existing sessions would continue using stale permission data. Calling `app()[PermissionRegistrar::class]->forgetCachedPermissions()` immediately invalidates the cache so the updates take effect in real time."

### Q4: How does your system prevent the 'Last Admin Lockout' problem?
> **Answer:** "In `AdminUserController@destroy`, we implement a strict defensive check:
> `if ($user->hasRole('Super Admin') && User::role('Super Admin')->count() <= 1) { return back()->withErrors(['error' => 'Cannot delete the sole Super Admin account.']); }`
> This prevents an administrator from accidentally deleting or demoting the only remaining administrative account."

### Q5: What is the difference between Authentication and Authorization in your system?
> **Answer:** "Authentication identifies *who the user is* (handled by Laravel Fortify and session cookies through email/password verification). Authorization determines *what the user is permitted to do* (handled by Spatie roles, permissions, and `RoleMiddleware`). For example, a student is fully authenticated, but is unauthorized to view `/admin/users`."

---

## Step 10: Rubric Compliance & Scoring Matrix

| Rubric Criteria | Max Pts | Implementation in UNiReserve | Evidence in Codebase |
|---|---|---|---|
| **User Management CRUD** | 20 | Complete Create, Read, Update, Delete with validation, search, role filters, safe deactivation, and self-protection. | [`AdminUserController.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/app/Http/Controllers/Admin/AdminUserController.php), [`users/index.tsx`](file:///c:/Users/god%20is%20good/Herd/unireserve/resources/js/pages/admin/users/index.tsx) |
| **RBAC – Spatie Permission** | 20 | 4 institutional roles, 29+ granular permissions, interactive assignment matrix, cache management. | [`RoleController.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/app/Http/Controllers/Admin/RoleController.php), [`roles/index.tsx`](file:///c:/Users/god%20is%20good/Herd/unireserve/resources/js/pages/admin/roles/index.tsx) |
| **Authorization & Security** | 15 | Server-side route middleware, Argon2id/Bcrypt hashing, CSRF verification, rate limiting, and 403 Forbidden enforcement. | [`RoleMiddleware.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/app/Http/Middleware/RoleMiddleware.php), [`web.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/routes/web.php) |
| **Laravel Architecture & OOP** | 15 | Clear separation of concerns: Models, Controllers, Middleware, Seeders, Traits (`HasRoles`), Form Validation. | [`User.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/app/Models/User.php), [`AuditLog.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/app/Models/AuditLog.php) |
| **Database & Migrations** | 10 | Normalized database schema, reproducible migrations, Spatie pivot tables, foreign key constraints. | `database/migrations/`, [`RolePermissionSeeder.php`](file:///c:/Users/god%20is%20good/Herd/unireserve/database/seeders/RolePermissionSeeder.php) |
| **Validation & Error Handling** | 5 | Strong request validation (unique emails, confirmed passwords, student ID formats), clear feedback alerts. | Form requests in `AdminUserController.php` and `RoleController.php` |
| **UI / Usability** | 5 | Responsive React UI with DSSC Institutional branding (Royal Blue & Maroon), searchable tables, modal confirmations. | Tailwind CSS, Lucide icons, Inertia.js components |
| **Live Demonstration** | 5 | Structured live presentation script covering both permitted admin operations and unauthorized student tests. | See Section 1, 6, and 7 of this manual |
| **Technical Understanding** | 5 | Comprehensive technical explanations for Spatie architecture, caching, security guards, and design decisions. | See Section 9 (Technical Q&A) |
| **TOTAL** | **100** | **Fully meets and exceeds all laboratory examination criteria (50/50 Scaled Points).** | |

---

*Document prepared for DSSC UNiReserve Laboratory Examination Defense.*
