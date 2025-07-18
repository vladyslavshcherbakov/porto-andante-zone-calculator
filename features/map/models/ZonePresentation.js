/**
 * Presentation model for zone display
 */
export class ZonePresentation {
    constructor(name, style, center, bounds, isHighlighted = false) {
        this.name = name;
        this.style = style;
        this.center = center; // {lat, lng}
        this.bounds = bounds; // {north, south, east, west}
        this.isHighlighted = isHighlighted;
    }
    
    /**
     * Get display label for the zone
     * @returns {string}
     */
    getDisplayLabel() {
        return this.name;
    }
    
    /**
     * Get tooltip content for the zone
     * @returns {string}
     */
    getTooltipContent() {
        return `<strong>Zone: ${this.name}</strong>`;
    }
    
    /**
     * Check if zone should be visible at current zoom level
     * @param {number} zoom 
     * @returns {boolean}
     */
    shouldShowLabel(zoom) {
        // Show labels at zoom level 12 and above
        return zoom >= 12;
    }
    
    /**
     * Get CSS class for zone styling
     * @returns {string}
     */
    getCssClass() {
        return this.isHighlighted ? 'zone-highlighted' : 'zone-default';
    }
}