/**
 * Presentation model for map state
 */
export class MapStatePresentation {
    constructor(center, zoom, bounds, highlightedZones = [], isLoading = false) {
        this.center = center; // {lat, lng}
        this.zoom = zoom;
        this.bounds = bounds; // {north, south, east, west}
        this.highlightedZones = highlightedZones; // Array of zone names
        this.isLoading = isLoading;
    }
    
    /**
     * Check if map is ready for interaction
     * @returns {boolean}
     */
    isReady() {
        return !this.isLoading && this.center && this.zoom;
    }
    
    /**
     * Check if any zones are highlighted
     * @returns {boolean}
     */
    hasHighlightedZones() {
        return this.highlightedZones.length > 0;
    }
    
    /**
     * Get number of highlighted zones
     * @returns {number}
     */
    getHighlightedZoneCount() {
        return this.highlightedZones.length;
    }
    
    /**
     * Check if specific zone is highlighted
     * @param {string} zoneName 
     * @returns {boolean}
     */
    isZoneHighlighted(zoneName) {
        return this.highlightedZones.includes(zoneName);
    }
    
    /**
     * Get map configuration for Leaflet
     * @returns {Object}
     */
    getLeafletConfig() {
        return {
            center: [this.center.lat, this.center.lng],
            zoom: this.zoom,
            bounds: this.bounds ? {
                southWest: [this.bounds.south, this.bounds.west],
                northEast: [this.bounds.north, this.bounds.east]
            } : null
        };
    }
    
    /**
     * Create new state with updated center and zoom
     * @param {Object} center 
     * @param {number} zoom 
     * @returns {MapStatePresentation}
     */
    withViewport(center, zoom) {
        return new MapStatePresentation(
            center,
            zoom,
            this.bounds,
            this.highlightedZones,
            this.isLoading
        );
    }
    
    /**
     * Create new state with highlighted zones
     * @param {Array<string>} zones 
     * @returns {MapStatePresentation}
     */
    withHighlightedZones(zones) {
        return new MapStatePresentation(
            this.center,
            this.zoom,
            this.bounds,
            zones,
            this.isLoading
        );
    }
    
    /**
     * Create new state with updated bounds
     * @param {Object} bounds 
     * @returns {MapStatePresentation}
     */
    withBounds(bounds) {
        return new MapStatePresentation(
            this.center,
            this.zoom,
            bounds,
            this.highlightedZones,
            this.isLoading
        );
    }
    
    /**
     * Create new state with loading status
     * @param {boolean} isLoading 
     * @returns {MapStatePresentation}
     */
    withLoadingState(isLoading) {
        return new MapStatePresentation(
            this.center,
            this.zoom,
            this.bounds,
            this.highlightedZones,
            isLoading
        );
    }
}