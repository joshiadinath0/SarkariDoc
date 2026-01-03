export const DepartmentIcons = {
    income_tax: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
            <text x="32" y="42" fontSize="28" fontWeight="bold" fill="#F97316" textAnchor="middle">₹</text>
        </svg>
    ),

    aadhaar: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#FEFCE8" stroke="#EAB308" strokeWidth="2" />
            <rect x="16" y="20" width="32" height="24" rx="2" fill="none" stroke="#EAB308" strokeWidth="2" />
            <line x1="20" y1="28" x2="36" y2="28" stroke="#EAB308" strokeWidth="2" />
            <line x1="20" y1="34" x2="44" y2="34" stroke="#EAB308" strokeWidth="1.5" />
            <line x1="20" y1="38" x2="40" y2="38" stroke="#EAB308" strokeWidth="1.5" />
        </svg>
    ),

    state_services: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2" />
            <rect x="20" y="38" width="24" height="8" fill="#16A34A" />
            <rect x="22" y="22" width="4" height="16" fill="#16A34A" />
            <rect x="30" y="22" width="4" height="16" fill="#16A34A" />
            <rect x="38" y="22" width="4" height="16" fill="#16A34A" />
            <path d="M18 22 L32 14 L46 22" stroke="#16A34A" strokeWidth="2" fill="none" />
        </svg>
    ),

    passport: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
            <rect x="22" y="16" width="20" height="32" rx="1" fill="none" stroke="#2563EB" strokeWidth="2" />
            <circle cx="32" cy="28" r="5" fill="none" stroke="#2563EB" strokeWidth="1.5" />
            <line x1="26" y1="38" x2="38" y2="38" stroke="#2563EB" strokeWidth="1.5" />
            <line x1="26" y1="42" x2="38" y2="42" stroke="#2563EB" strokeWidth="1.5" />
        </svg>
    ),

    banking: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
            <rect x="18" y="40" width="28" height="6" fill="#6366F1" />
            <rect x="20" y="26" width="4" height="14" fill="#6366F1" />
            <rect x="28" y="26" width="4" height="14" fill="#6366F1" />
            <rect x="36" y="26" width="4" height="14" fill="#6366F1" />
            <path d="M16 26 L32 18 L48 26" stroke="#6366F1" strokeWidth="2" fill="none" />
        </svg>
    ),
}

export type DepartmentIconKey = keyof typeof DepartmentIcons
