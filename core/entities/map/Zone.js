/**
 * Zone entity representing a geographic zone with boundaries.
 * 
 * This is a pure domain entity that encapsulates zone business logic
 * without any external dependencies. It handles geographic calculations
 * and zone property management.
 * 
 * Responsibilities:
 * - Encapsulates zone identity and properties
 * - Calculates geometric bounds from GeoJSON geometry
 * - Provides center point calculations
 * - Handles zone comparison and equality
 * - Validates coordinate data integrity
 * 
 * @class Zone
 */
export class Zone {
    constructor(id, name, geometry, geoJsonId = null) {
        this.id = id; // Zone name (e.g., "ARC13")
        this.name = name; // Zone display name (same as id)
        this.geometry = geometry; // GeoJSON geometry
        this.geoJsonId = geoJsonId; // Original GeoJSON numeric ID
    }
    
    /**
     * Check if this zone equals another zone
     * @param {Zone} other 
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id && this.name === other.name;
    }
    
    /**
     * Get zone code (same as id)
     * @returns {string}
     */
    getCode() {
        return this.id;
    }
    
    /**
     * Get zone display name
     * @returns {string}
     */
    getDisplayName() {
        return this.name;
    }
    
    
    /**
     * Get center point of the zone
     * @returns {Object} {lat, lng}
     */
    getCenter() {
        if (!this.geometry || !this.geometry.coordinates) {
            return null;
        }
        
        // Simple centroid calculation for polygon
        if (this.geometry.type === 'Polygon') {
            const coords = this.geometry.coordinates[0];
            let lat = 0, lng = 0;
            
            for (const coord of coords) {
                lng += coord[0];
                lat += coord[1];
            }
            
            return {
                lat: lat / coords.length,
                lng: lng / coords.length
            };
        }
        
        return null;
    }
    
    /**
     * Get bounding box of the zone
     * @returns {Object} {north, south, east, west}
     */
    getBounds() {
        if (!this.geometry || !this.geometry.coordinates) {
            return null;
        }
        
        if (this.geometry.type === 'Polygon') {
            const coords = this.geometry.coordinates[0];
            let north = -Infinity, south = Infinity;
            let east = -Infinity, west = Infinity;
            
            for (const coord of coords) {
                const lng = coord[0];
                const lat = coord[1];
                
                // Add validation to prevent NaN values
                if (isNaN(lat) || isNaN(lng)) {
                    console.warn('Invalid coordinate in zone', this.name, ':', [lng, lat]);
                    continue;
                }
                
                if (lat > north) north = lat;
                if (lat < south) south = lat;
                if (lng > east) east = lng;
                if (lng < west) west = lng;
            }
            
            // Ensure we have valid bounds
            if (north === -Infinity || south === Infinity || east === -Infinity || west === Infinity) {
                console.warn('Invalid bounds calculated for zone', this.name);
                return null;
            }
            
            return { north, south, east, west };
        }
        
        return null;
    }
}