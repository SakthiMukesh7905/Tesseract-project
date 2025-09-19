# Role-Based Access Control Implementation

## Overview
This implementation adds role-based access control to the Tesseract project, supporting both Admin and Department user roles with different dashboards and permissions.

## Features Implemented

### 1. Authentication System
- **Enhanced AuthContext**: Now stores user role and information alongside authentication token
- **Role-based Login**: Login form includes role selection (Admin/Department)
- **Persistent Storage**: User role and info are saved in localStorage for session persistence

### 2. User Roles

#### Admin Role
- **Dashboard**: Full admin dashboard with map view and statistics
- **Issues Management**: Complete issues management with deduplication
- **Progress Tracking**: Track all issues across departments
- **Community**: Community management features
- **API Access**: Full access to all admin endpoints

#### Department Role
- **Department Dashboard**: Specialized dashboard showing assigned issues
- **Assigned Issues**: View and manage only issues assigned to their department
- **Status Updates**: Update issue status (Pending, In Progress, Resolved)
- **Comments**: Add comments when updating status
- **API Access**: Limited to department-specific endpoints

### 3. New Pages Created

#### DepartmentDashboard.jsx
- Statistics cards showing assignment counts
- Table view of all assigned issues
- Status update functionality
- Real-time data refresh

#### DepartmentIssues.jsx
- Card-based view of assignments
- Detailed issue viewing with popup dialogs
- Status update with comments
- Issue details including location, reporter info, and media

### 4. Routing System
- **Role-based Route Protection**: Routes are protected based on user role
- **Automatic Redirects**: Users are redirected to appropriate dashboard based on role
- **Private Routes**: Enhanced private route component with role validation

### 5. Navigation
- **Dynamic Navigation**: Sidebar navigation changes based on user role
- **Role-specific Menu Items**: Different menu items for Admin vs Department users
- **User Info Display**: Header shows user name and role

## API Endpoints Used

### Admin Endpoints
- `GET /posts/all` - Get all posts (superadmin only)
- `GET /posts/stats` - Get statistics
- `POST /admin/posts/acknowledge-cluster` - Acknowledge issue clusters
- `GET /admin/posts/deduplicate` - Deduplicate issues

### Department Endpoints
- `GET /cluster-assignments` - Get department assignments
- `GET /cluster-assignments/:id` - Get specific assignment details
- `PATCH /cluster-assignments/:id` - Update assignment status

## Usage

### For Admins
1. Login with role "Admin"
2. Access full dashboard with map view
3. Manage all issues and assign to departments
4. View comprehensive statistics

### For Departments
1. Login with role "Department"
2. Access department-specific dashboard
3. View only assigned issues
4. Update issue status and add comments

## Security Features
- JWT token-based authentication
- Role-based route protection
- API endpoint access control
- Session persistence with localStorage
- Automatic logout on invalid tokens

## File Structure
```
src/
├── pages/
│   ├── DepartmentDashboard.jsx    # Department dashboard
│   ├── DepartmentIssues.jsx       # Department issues management
│   └── Login.jsx                  # Enhanced login with role selection
├── components/
│   ├── AppDrawer.jsx              # Dynamic navigation based on role
│   └── AppHeader.jsx              # User info and role display
├── utils/
│   ├── AuthContext.js             # Enhanced auth context with roles
│   └── api.js                     # API configuration
└── routes.jsx                     # Role-based routing
```

## Backend Requirements
The frontend expects the following backend endpoints to be implemented:

### Authentication
- `POST /admin/login` - Admin login
- `POST /department/login` - Department login

### Admin APIs
- `GET /posts/all` - Get all posts (role: superadmin)
- `GET /posts/stats` - Get statistics
- `POST /admin/posts/acknowledge-cluster` - Acknowledge clusters
- `GET /admin/posts/deduplicate` - Deduplicate issues

### Department APIs
- `GET /cluster-assignments` - Get department assignments
- `GET /cluster-assignments/:id` - Get assignment details
- `PATCH /cluster-assignments/:id` - Update assignment status

## Testing
1. Test admin login and dashboard access
2. Test department login and dashboard access
3. Test role-based route protection
4. Test status update functionality
5. Test navigation between different user types
