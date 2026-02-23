/**
 * AI Model type for the scrolling showcase section
 */
export interface AIModel {
    /** Display name of the model */
    name: string;
    /** Type of media content */
    type: 'image' | 'video';
    /** Source URL for the media */
    src: string;
}

/**
 * Professional tool configuration
 */
export interface Tool {
    /** Unique identifier for the tool */
    id: string;
    /** Display label */
    label: string;
    /** Asset URL to show when tool is active */
    asset: string;
}

/**
 * Props for the ToolChip component
 */
export interface ToolChipProps {
    /** Display label for the chip */
    label: string;
    /** Whether this tool is currently active */
    isActive: boolean;
    /** Callback when chip is hovered */
    onHover: () => void;
    /** Callback when mouse leaves chip */
    onLeave: () => void;
    /** Optional click handler for mobile touch interactions */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Inline styles for positioning */
    style?: React.CSSProperties;
}

