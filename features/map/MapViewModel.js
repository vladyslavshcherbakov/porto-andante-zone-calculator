import { ZoneGeoJSONRepository } from '../../data/repositories/map/ZoneGeoJSONRepository.js';
import { MapBounds } from '../../core/entities/map/MapBounds.js';
import { MapPresentationMapper } from './mappers/MapPresentationMapper.js';
import { MapStatePresentation } from './models/MapStatePresentation.js';
import { TicketInfoPresentation } from './models/TicketInfoPresentation.js';

/**
 * ViewModel for map feature following Clean Architecture principles.
 * 
 * Responsibilities:
 * - Manages map state and business logic
 * - Orchestrates zone highlighting and ticket information display
 * - Provides observer pattern for View updates
 * - Handles zone validation and bounds calculations
 * 
 * Architecture:
 * - Depends on ZoneGeoJSONRepository for data access
 * - Uses MapBounds entity for geometric calculations
 * - Maintains state through MapStatePresentation and TicketInfoPresentation
 * - Notifies MapView of state changes through observer pattern
 * 
 * @class MapViewModel
 */
export class MapViewModel {
    constructor() {
        this.listeners = [];
        this.currentState = null;
        this.currentTicketInfo = null;
        this.allZones = null;
        
        // Initialize dependencies
        this.zoneRepository = new ZoneGeoJSONRepository();
        
        // Initialize with default state
        this.currentState = new MapStatePresentation(
            { lat: 41.1579, lng: -8.6291 }, // Porto center
            11,
            null,
            [],
            true // Initially loading
        );
    }
    
    /**
     * Add a listener for state changes
     * @param {Function} listener 
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    
    /**
     * Remove a listener
     * @param {Function} listener 
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    
    /**
     * Notify all listeners of state changes
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.currentState, this.currentTicketInfo));
    }
    
    /**
     * Initialize map with default data
     */
    async initialize() {
        try {
            // Load all zones
            this.allZones = await this.zoneRepository.loadAllZones();
            
            // Get default bounds
            const defaultBounds = MapBounds.fromZones(this.allZones);
            const defaultCenter = defaultBounds ? defaultBounds.getCenter() : { lat: 41.1579, lng: -8.6291 };
            
            // Update state
            this.currentState = MapPresentationMapper.mapToMapState(
                defaultCenter,
                11,
                defaultBounds,
                [],
                false
            );
            
            this.notifyListeners();
            
        } catch (error) {
            console.error('MapViewModel initialization error:', error);
            
            // Set error state
            this.currentState = this.currentState.withLoadingState(false);
            this.notifyListeners();
        }
    }
    
    /**
     * Highlight specific zones
     * @param {Array<string>} zoneNames 
     * @param {string} ticketTitle 
     * @param {string} startStop 
     * @param {number} validityMinutes 
     * @param {string} ticketType 
     */
    async highlightZones(zoneNames, ticketTitle = null, startStop = null, validityMinutes = null, ticketType = null) {
        try {
            // Get zones by names directly from repository
            const zones = await this.zoneRepository.getZonesByNames(zoneNames);
            
            // Update state with highlighted zones
            this.currentState = this.currentState.withHighlightedZones(zones.getAllZoneNames());
            
            // Update bounds if zones were found
            const bounds = MapBounds.fromZones(zones);
            if (bounds) {
                this.currentState = this.currentState.withBounds(bounds);
            }
            
            // Create ticket info if provided
            if (ticketTitle && zoneNames.length > 0) {
                this.currentTicketInfo = MapPresentationMapper.mapTicketInfoToPresentation(
                    ticketTitle,
                    zoneNames,
                    startStop,
                    validityMinutes,
                    ticketType
                );
            } else {
                this.currentTicketInfo = null;
            }
            
            this.notifyListeners();
            
        } catch (error) {
            console.error('MapViewModel highlightZones error:', error);
        }
    }
    
    /**
     * Clear all zone highlights
     */
    async clearHighlights() {
        try {
            this.currentState = this.currentState.withHighlightedZones([]);
            this.currentTicketInfo = null;
            
            // Reset to default bounds
            const defaultBounds = this.allZones ? MapBounds.fromZones(this.allZones) : null;
            if (defaultBounds) {
                this.currentState = this.currentState.withBounds(defaultBounds);
            }
            
            this.notifyListeners();
            
        } catch (error) {
            console.error('MapViewModel clearHighlights error:', error);
        }
    }
    
    /**
     * Show all zones (reset to default view)
     */
    async showAllZones() {
        await this.clearHighlights();
    }
    
    /**
     * Get optimal bounds for highlighted zones
     * @returns {Object|null}
     */
    getOptimalBounds() {
        if (!this.currentState.hasHighlightedZones()) {
            return null;
        }
        
        return this.currentState.bounds;
    }
    
    /**
     * Update map viewport
     * @param {Object} center 
     * @param {number} zoom 
     */
    updateViewport(center, zoom) {
        this.currentState = this.currentState.withViewport(center, zoom);
        // Don't notify listeners for viewport changes to avoid infinite loops
    }
    
    /**
     * Get all available zones
     * @returns {ZoneCollection|null}
     */
    getAllZones() {
        return this.allZones;
    }
    
    /**
     * Get current map state
     * @returns {MapStatePresentation}
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * Get current ticket info
     * @returns {TicketInfoPresentation|null}
     */
    getCurrentTicketInfo() {
        return this.currentTicketInfo;
    }
    
    /**
     * Check if map is ready
     * @returns {boolean}
     */
    isReady() {
        return this.currentState.isReady() && this.allZones !== null;
    }
    
    /**
     * Get zones for display
     * @returns {Array<ZonePresentation>}
     */
    getZonesForDisplay() {
        if (!this.allZones) {
            return [];
        }
        
        return MapPresentationMapper.mapZonesToPresentations(
            this.allZones, 
            this.currentState.highlightedZones
        );
    }
    
    /**
     * Validate zones exist
     * @param {Array<string>} zoneNames 
     * @returns {Promise<{valid: Array<string>, invalid: Array<string>}>}
     */
    async validateZones(zoneNames) {
        try {
            if (!this.allZones) {
                await this.initialize();
            }
            
            const valid = [];
            const invalid = [];
            
            for (const zoneName of zoneNames) {
                if (this.allZones.getZoneByName(zoneName)) {
                    valid.push(zoneName);
                } else {
                    invalid.push(zoneName);
                }
            }
            
            return { valid, invalid };
        } catch (error) {
            console.error('MapViewModel validateZones error:', error);
            return { valid: [], invalid: zoneNames };
        }
    }
    
    /**
     * Get raw GeoJSON data (for Leaflet)
     * @returns {Promise<Object>}
     */
    async getRawGeoJsonData() {
        try {
            return await this.zoneRepository.getRawGeoJsonData();
        } catch (error) {
            console.error('MapViewModel getRawGeoJsonData error:', error);
            throw error;
        }
    }
}