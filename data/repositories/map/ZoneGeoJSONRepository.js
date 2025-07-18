import { Zone } from '../../../core/entities/map/Zone.js';
import { ZoneCollection } from '../../../core/entities/map/ZoneCollection.js';

/**
 * Repository for loading zone data from GeoJSON files.
 * 
 * Implements the Repository pattern to abstract zone data access.
 * Provides caching for performance and handles GeoJSON parsing.
 * 
 * Responsibilities:
 * - Loads zone boundary data from GeoJSON files
 * - Parses GeoJSON features into Zone entities
 * - Provides caching mechanism for performance
 * - Handles data validation and error recovery
 * - Supports zone filtering and lookup operations
 * 
 * @class ZoneGeoJSONRepository
 */
export class ZoneGeoJSONRepository {
    constructor(geoJsonPath = './resources/zAndante.geojson') {
        this.geoJsonPath = geoJsonPath;
        this.cachedZones = null;
    }
    
    /**
     * Load all zones from GeoJSON file
     * @returns {Promise<ZoneCollection>}
     */
    async loadAllZones() {
        if (this.cachedZones) {
            return this.cachedZones;
        }
        
        try {
            const response = await fetch(this.geoJsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load zones: ${response.status}`);
            }
            
            const geoJsonData = await response.json();
            const zones = this.parseGeoJsonToZones(geoJsonData);
            
            this.cachedZones = new ZoneCollection(zones);
            return this.cachedZones;
            
        } catch (error) {
            console.error('Error loading zones from GeoJSON:', error);
            throw new Error('Failed to load zone data');
        }
    }
    
    /**
     * Get zones by names
     * @param {Array<string>} zoneNames 
     * @returns {Promise<ZoneCollection>}
     */
    async getZonesByNames(zoneNames) {
        const allZones = await this.loadAllZones();
        const filteredZones = allZones.getZonesByNames(zoneNames);
        return new ZoneCollection(filteredZones);
    }
    
    /**
     * Get zone by name
     * @param {string} zoneName 
     * @returns {Promise<Zone|null>}
     */
    async getZoneByName(zoneName) {
        const allZones = await this.loadAllZones();
        return allZones.getZoneByName(zoneName);
    }
    
    /**
     * Check if zone exists
     * @param {string} zoneName 
     * @returns {Promise<boolean>}
     */
    async zoneExists(zoneName) {
        const zone = await this.getZoneByName(zoneName);
        return zone !== null;
    }
    
    /**
     * Get all zone names
     * @returns {Promise<Array<string>>}
     */
    async getAllZoneNames() {
        const allZones = await this.loadAllZones();
        return allZones.getAllZoneNames();
    }
    
    /**
     * Parse GeoJSON data to Zone entities
     * @param {Object} geoJsonData 
     * @returns {Array<Zone>}
     */
    parseGeoJsonToZones(geoJsonData) {
        if (!geoJsonData || !geoJsonData.features) {
            throw new Error('Invalid GeoJSON data format');
        }
        
        return geoJsonData.features.map(feature => {
            const zoneName = feature.properties?.zona;
            const geoJsonId = feature.properties?.id;
            
            if (!zoneName) {
                console.warn('Feature missing zona property:', feature);
                return null;
            }
            
            return new Zone(
                zoneName, // Zone code (e.g., "ARC13")
                zoneName, // Display name (same as code)
                feature.geometry,
                geoJsonId // Original GeoJSON numeric ID
            );
        }).filter(zone => zone !== null);
    }
    
    /**
     * Get raw GeoJSON data
     * @returns {Promise<Object>}
     */
    async getRawGeoJsonData() {
        const response = await fetch(this.geoJsonPath);
        if (!response.ok) {
            throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        return response.json();
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cachedZones = null;
    }
}