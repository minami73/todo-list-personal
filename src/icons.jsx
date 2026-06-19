const Icon = {
    Check: (props) => (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
    ),
    Plus: (props) => (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
            <path d="M8 3.5v9M3.5 8h9" />
        </svg>
    ),
    Pencil: (props) => (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M11.2 2.4l2.4 2.4-8 8H3.2v-2.4l8-8z" />
            <path d="M10.2 3.4l2.4 2.4" />
        </svg>
    ),
    Trash: (props) => (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 4.5h10M6.5 4.5V3.2c0-.5.4-.9.9-.9h1.2c.5 0 .9.4.9.9v1.3" />
            <path d="M4.5 4.5l.6 8.2c0 .5.4.9.9.9h3.9c.5 0 .9-.4.9-.9l.7-8.2" />
        </svg>
    ),
    Grip: (props) => (
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" {...props}>
            <circle cx="3" cy="3" r="1" />
            <circle cx="7" cy="3" r="1" />
            <circle cx="3" cy="7" r="1" />
            <circle cx="7" cy="7" r="1" />
            <circle cx="3" cy="11" r="1" />
            <circle cx="7" cy="11" r="1" />
        </svg>
    ),
    List: (props) => (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
            <path d="M3 4.5h10M3 8h10M3 11.5h7" />
        </svg>
    ),
    Sun: (props) => (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1.5v1.5M8 13v1.5M2.3 2.3l1 1M12.7 12.7l1 1M1.5 8H3M13 8h1.5M2.3 13.7l1-1M12.7 3.3l1-1" />
        </svg>
    ),
    Moon: (props) => (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M13.5 9.8A5.5 5.5 0 1 1 6.2 2.5a4.3 4.3 0 0 0 7.3 7.3z" />
        </svg>
    ),
    PriorityNone: (props) => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
            <path d="M2 6h8" strokeDasharray="1.5 1.5" />
        </svg>
    ),
    PriorityLow: (props) => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...props}>
            <rect x="1.5" y="7.5" width="2" height="3" rx="0.5" />
            <rect x="5" y="7.5" width="2" height="3" rx="0.5" opacity="0.22" />
            <rect x="8.5" y="7.5" width="2" height="3" rx="0.5" opacity="0.22" />
        </svg>
    ),
    PriorityMedium: (props) => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...props}>
            <rect x="1.5" y="7.5" width="2" height="3" rx="0.5" />
            <rect x="5" y="5" width="2" height="5.5" rx="0.5" />
            <rect x="8.5" y="7.5" width="2" height="3" rx="0.5" opacity="0.22" />
        </svg>
    ),
    PriorityHigh: (props) => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...props}>
            <rect x="1.5" y="7.5" width="2" height="3" rx="0.5" />
            <rect x="5" y="5" width="2" height="5.5" rx="0.5" />
            <rect x="8.5" y="2.5" width="2" height="8" rx="0.5" />
        </svg>
    ),
    Close: (props) => (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
            <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
    ),
};

const PRIORITY = {
    none: { label: "Sin prioridad", short: "—", order: 4, Icon: Icon.PriorityNone },
    low: { label: "Baja", short: "Baja", order: 3, Icon: Icon.PriorityLow },
    medium: { label: "Media", short: "Media", order: 2, Icon: Icon.PriorityMedium },
    high: { label: "Alta", short: "Alta", order: 1, Icon: Icon.PriorityHigh },
};

const PRIORITY_ORDER = ["none", "low", "medium", "high"];

export { Icon, PRIORITY, PRIORITY_ORDER };
