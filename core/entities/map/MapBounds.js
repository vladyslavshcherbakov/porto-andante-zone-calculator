/**
 * Map bounds entity for managing viewport bounds
 */
export class MapBounds {
    constructor(north, south, east, west) {
        this.north = north;
        this.south = south;
        this.east = east;
        this.west = west;
    }
    
    /**
     * Create bounds from center point and zoom level
     * @param {Object} center - {lat, lng}
     * @param {number} zoom - Zoom level
     * @returns {MapBounds}
     */
    static fromCenter(center, zoom) {
        // Approximate bounds calculation based on zoom
        const latDelta = 180 / Math.pow(2, zoom);
        const lngDelta = 360 / Math.pow(2, zoom);
        
        return new MapBounds(
            center.lat + latDelta/2,
            center.lat - latDelta/2,
            center.lng + lngDelta/2,
            center.lng - lngDelta/2
        );
    }
    
    /**
     * Create bounds from zone collection
     * @param {ZoneCollection} zones 
     * @returns {MapBounds|null}
     */
    static fromZones(zones) {
        const bounds = zones.getBounds();
        if (!bounds) return null;
        
        return new MapBounds(
            bounds.north,
            bounds.south,
            bounds.east,
            bounds.west
        );
    }
    
    /**
     * Get center point of bounds
     * @returns {Object} {lat, lng}
     */
    getCenter() {
        return {
            lat: (this.north + this.south) / 2,
            lng: (this.east + this.west) / 2
        };
    }
    
    /**
     * Check if bounds contain a point
     * @param {Object} point - {lat, lng}
     * @returns {boolean}
     */
    contains(point) {
        return point.lat >= this.south && 
               point.lat <= this.north &&
               point.lng >= this.west && 
               point.lng <= this.east;
    }
    
    /**
     * Check if bounds intersect with another bounds
     * @param {MapBounds} other 
     * @returns {boolean}
     */
    intersects(other) {
        return !(this.north < other.south || 
                this.south > other.north ||
                this.east < other.west || 
                this.west > other.east);
    }
    
    /**
     * Expand bounds by a padding amount
     * @param {number} padding - Padding in degrees
     * @returns {MapBounds}
     */
    pad(padding) {
        return new MapBounds(
            this.north + padding,
            this.south - padding,
            this.east + padding,
            this.west - padding
        );
    }
    
    /**
     * Check if bounds are valid
     * @returns {boolean}
     */
    isValid() {
        return this.north > this.south && this.east > this.west;
    }
    
    /**
     * Convert to array format [south, west, north, east]
     * @returns {Array<number>}
     */
    toArray() {
        return [this.south, this.west, this.north, this.east];
    }
    
    /**
     * Convert to Leaflet bounds format
     * @returns {Object}
     */
    toLeafletBounds() {
        return {
            southWest: { lat: this.south, lng: this.west },
            northEast: { lat: this.north, lng: this.east }
        };
    }
}