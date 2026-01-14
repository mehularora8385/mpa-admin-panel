/**
 * Role-Based Access Control (RBAC) System
 * Manages user roles and permissions
 */

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    VIEWER: 'viewer'
};

const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',
    
    // Exams
    CREATE_EXAM: 'create_exam',
    EDIT_EXAM: 'edit_exam',
    DELETE_EXAM: 'delete_exam',
    VIEW_EXAMS: 'view_exams',
    
    // Candidates
    UPLOAD_CANDIDATES: 'upload_candidates',
    EDIT_CANDIDATES: 'edit_candidates',
    DELETE_CANDIDATES: 'delete_candidates',
    VIEW_CANDIDATES: 'view_candidates',
    EXPORT_CANDIDATES: 'export_candidates',
    
    // Operators
    CREATE_OPERATOR: 'create_operator',
    EDIT_OPERATOR: 'edit_operator',
    DELETE_OPERATOR: 'delete_operator',
    VIEW_OPERATORS: 'view_operators',
    
    // Centres
    CREATE_CENTRE: 'create_centre',
    EDIT_CENTRE: 'edit_centre',
    DELETE_CENTRE: 'delete_centre',
    VIEW_CENTRES: 'view_centres',
    
    // Reports
    GENERATE_REPORTS: 'generate_reports',
    EXPORT_REPORTS: 'export_reports',
    
    // Users
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    VIEW_USERS: 'view_users',
    
    // Audit
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    
    // System
    SYSTEM_SETTINGS: 'system_settings'
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: [
        // All permissions
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.CREATE_EXAM,
        PERMISSIONS.EDIT_EXAM,
        PERMISSIONS.DELETE_EXAM,
        PERMISSIONS.VIEW_EXAMS,
        PERMISSIONS.UPLOAD_CANDIDATES,
        PERMISSIONS.EDIT_CANDIDATES,
        PERMISSIONS.DELETE_CANDIDATES,
        PERMISSIONS.VIEW_CANDIDATES,
        PERMISSIONS.EXPORT_CANDIDATES,
        PERMISSIONS.CREATE_OPERATOR,
        PERMISSIONS.EDIT_OPERATOR,
        PERMISSIONS.DELETE_OPERATOR,
        PERMISSIONS.VIEW_OPERATORS,
        PERMISSIONS.CREATE_CENTRE,
        PERMISSIONS.EDIT_CENTRE,
        PERMISSIONS.DELETE_CENTRE,
        PERMISSIONS.VIEW_CENTRES,
        PERMISSIONS.GENERATE_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.VIEW_AUDIT_LOGS,
        PERMISSIONS.SYSTEM_SETTINGS
    ],
    [ROLES.ADMIN]: [
        // Admin permissions (no user management)
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.CREATE_EXAM,
        PERMISSIONS.EDIT_EXAM,
        PERMISSIONS.VIEW_EXAMS,
        PERMISSIONS.UPLOAD_CANDIDATES,
        PERMISSIONS.EDIT_CANDIDATES,
        PERMISSIONS.VIEW_CANDIDATES,
        PERMISSIONS.EXPORT_CANDIDATES,
        PERMISSIONS.CREATE_OPERATOR,
        PERMISSIONS.EDIT_OPERATOR,
        PERMISSIONS.VIEW_OPERATORS,
        PERMISSIONS.CREATE_CENTRE,
        PERMISSIONS.EDIT_CENTRE,
        PERMISSIONS.VIEW_CENTRES,
        PERMISSIONS.GENERATE_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.VIEW_AUDIT_LOGS
    ],
    [ROLES.VIEWER]: [
        // Viewer permissions (read-only)
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_EXAMS,
        PERMISSIONS.VIEW_CANDIDATES,
        PERMISSIONS.EXPORT_CANDIDATES,
        PERMISSIONS.VIEW_OPERATORS,
        PERMISSIONS.VIEW_CENTRES,
        PERMISSIONS.GENERATE_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.VIEW_AUDIT_LOGS
    ]
};

class RBACManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');

        if (token && role) {
            this.currentUser = {
                name: name,
                role: role,
                token: token
            };
            this.currentRole = role;
        }
    }

    isLoggedIn() {
        return !!this.currentUser && !!localStorage.getItem('authToken');
    }

    hasPermission(permission) {
        if (!this.isLoggedIn()) return false;
        const permissions = ROLE_PERMISSIONS[this.currentRole] || [];
        return permissions.includes(permission);
    }

    hasRole(role) {
        return this.currentRole === role;
    }

    hasAnyRole(roles) {
        return roles.includes(this.currentRole);
    }

    hasAllPermissions(permissions) {
        return permissions.every(p => this.hasPermission(p));
    }

    hasAnyPermission(permissions) {
        return permissions.some(p => this.hasPermission(p));
    }

    getCurrentRole() {
        return this.currentRole;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        this.currentUser = null;
        this.currentRole = null;
        window.location.href = 'login.html';
    }

    setUser(user) {
        this.currentUser = user;
        this.currentRole = user.role;
        localStorage.setItem('authToken', user.token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
    }
}

// Create global RBAC instance
const rbac = new RBACManager();

// Helper function to hide/show elements based on permissions
function showElementIfPermitted(elementId, permission) {
    const element = document.getElementById(elementId);
    if (element) {
        if (rbac.hasPermission(permission)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    }
}

function showElementIfRole(elementId, role) {
    const element = document.getElementById(elementId);
    if (element) {
        if (rbac.hasRole(role)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    }
}

// Check if user is logged in on page load
window.addEventListener('load', () => {
    if (!rbac.isLoggedIn()) {
        // Redirect to login if not on login page
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RBACManager, ROLES, PERMISSIONS, rbac };
}
