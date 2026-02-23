/**
 * Workflow card for the slider section
 */
export interface WorkflowCard {
    /** Unique identifier */
    id: string;
    /** Display title */
    title: string;
    /** Preview image URL */
    image: string;
}

/**
 * Single footer link item
 */
export interface FooterLink {
    /** Display label */
    label: string;
    /** Target URL */
    href: string;
}

/**
 * Footer link column grouping
 */
export interface FooterColumn {
    /** Column title */
    title: string;
    /** Links in this column */
    links: FooterLink[];
}

/**
 * Navigation link item
 */
export interface NavLink {
    /** Display label */
    label: string;
}

/**
 * Social media link configuration
 */
export interface SocialLink {
    /** Platform name */
    platform: string;
    /** Target URL */
    href: string;
    /** Icon component name */
    icon: 'linkedin' | 'instagram' | 'twitter' | 'discord' | 'youtube';
}

/**
 * Mouse position coordinates (normalized -0.5 to 0.5)
 */
export interface MousePosition {
    x: number;
    y: number;
}

/**
 * Scroll progress state
 */
export interface ScrollProgress {
    /** Raw scroll Y value */
    scrollY: number;
    /** Normalized progress (0 to 1) */
    progress: number;
}

/**
 * Parallax image configuration for the composition
 */
export interface ParallaxImage {
    /** Image source URL */
    src: string;
    /** Alt text */
    alt: string;
    /** CSS classes */
    className: string;
    /** CSS left position */
    left: string;
    /** CSS top position */
    top: string;
    /** Base X offset percentage */
    baseX: number;
    /** Base Y offset percentage */
    baseY: number;
    /** Scroll parallax multipliers [x, y] */
    scrollMultiplier: [number, number];
    /** Mouse parallax multiplier */
    mouseMultiplier: number;
    /** Optional z-index */
    zIndex?: number;
    /** Optional additional transform */
    additionalTransform?: string;
}

/**
 * Tool chip position configuration
 */
export interface ChipPosition {
    /** Tool ID to match with PROFESSIONAL_TOOLS */
    toolId: string;
    /** CSS top position */
    top: string;
    /** CSS left position */
    left?: string;
    /** CSS right position */
    right?: string;
}

/**
 * Navigation button props for sliders
 */
export interface NavigationButtonProps {
    /** Direction of navigation */
    direction: 'left' | 'right';
    /** Click handler */
    onClick: () => void;
    /** Whether button is disabled */
    disabled: boolean;
    /** Button size variant */
    size?: 'normal' | 'small';
}
