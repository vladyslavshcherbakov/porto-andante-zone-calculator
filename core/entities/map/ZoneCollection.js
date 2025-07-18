import { Zone } from './Zone.js';

/**
 * Collection of zones with operations
 */
export class ZoneCollection {
    constructor(zones = []) {
        this.zones = zones;
    }
    
    /**
     * Add a zone to the collection
     * @param {Zone} zone 
     */
    addZone(zone) {
        if (!(zone instanceof Zone)) {
            throw new Error('Only Zone instances can be added to ZoneCollection');
        }
        
        // Avoid duplicates
        if (!this.zones.some(z => z.equals(zone))) {
            this.zones.push(zone);
        }
    }
    
    /**
     * Get zone by ID
     * @param {string} id 
     * @returns {Zone|null}
     */
    getZoneById(id) {
        return this.zones.find(zone => zone.id === id) || null;
    }
    
    /**
     * Get zone by name
     * @param {string} name 
     * @returns {Zone|null}
     */
    getZoneByName(name) {
        return this.zones.find(zone => zone.name === name) || null;
    }
    
    /**
     * Get zones by names
     * @param {Array<string>} names 
     * @returns {Array<Zone>}
     */
    getZonesByNames(names) {
        return this.zones.filter(zone => names.includes(zone.name));
    }
    
    /**
     * Get all zone names
     * @returns {Array<string>}
     */
    getAllZoneNames() {
        return this.zones.map(zone => zone.getDisplayName());
    }
    
    
    /**
     * Get number of zones
     * @returns {number}
     */
    size() {
        return this.zones.length;
    }
    
    /**
     * Check if collection is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.zones.length === 0;
    }
    
    /**
     * Get bounding box that contains all zones
     * @returns {Object} {north, south, east, west}
     */
    getBounds() {
        if (this.isEmpty()) {
            return null;
        }
        
        let north = -Infinity, south = Infinity;
        let east = -Infinity, west = Infinity;
        
        for (const zone of this.zones) {
            const bounds = zone.getBounds();
            if (bounds) {
                if (bounds.north > north) north = bounds.north;
                if (bounds.south < south) south = bounds.south;
                if (bounds.east > east) east = bounds.east;
                if (bounds.west < west) west = bounds.west;
            }
        }
        
        // Ensure we have valid bounds
        if (north === -Infinity || south === Infinity || east === -Infinity || west === Infinity) {
            console.warn('Invalid bounds calculated for zone collection');
            return null;
        }
        
        return { north, south, east, west };
    }
    
    /**
     * Filter zones by a predicate
     * @param {Function} predicate 
     * @returns {ZoneCollection}
     */
    filter(predicate) {
        const filteredZones = this.zones.filter(predicate);
        return new ZoneCollection(filteredZones);
    }
    
    /**
     * Map zones to another type
     * @param {Function} mapper 
     * @returns {Array}
     */
    map(mapper) {
        return this.zones.map(mapper);
    }
    
    /**
     * Convert to array
     * @returns {Array<Zone>}
     */
    toArray() {
        return [...this.zones];
    }
}