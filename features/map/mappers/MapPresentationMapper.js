import { ZonePresentation } from '../models/ZonePresentation.js';
import { TicketInfoPresentation } from '../models/TicketInfoPresentation.js';
import { MapStatePresentation } from '../models/MapStatePresentation.js';

/**
 * Mapper for converting map domain objects to presentation objects
 */
export class MapPresentationMapper {
    
    /**
     * Map Zone entity to ZonePresentation
     * @param {Zone} zone 
     * @param {boolean} isHighlighted 
     * @returns {ZonePresentation}
     */
    static mapZoneToPresentation(zone, isHighlighted = false) {
        const style = isHighlighted ? 
            MapPresentationMapper.getHighlightedZoneStyle() : 
            MapPresentationMapper.getDefaultZoneStyle();
        
        return new ZonePresentation(
            zone.getDisplayName(),
            style,
            zone.getCenter(),
            zone.getBounds(),
            isHighlighted
        );
    }
    
    /**
     * Map ZoneCollection to array of ZonePresentations
     * @param {ZoneCollection} zones 
     * @param {Array<string>} highlightedZoneNames 
     * @returns {Array<ZonePresentation>}
     */
    static mapZonesToPresentations(zones, highlightedZoneNames = []) {
        return zones.map(zone => {
            const isHighlighted = highlightedZoneNames.includes(zone.getDisplayName());
            return MapPresentationMapper.mapZoneToPresentation(zone, isHighlighted);
        });
    }
    
    /**
     * Map ticket information to TicketInfoPresentation
     * @param {string} title 
     * @param {Array<string>} zones 
     * @param {string} startStop 
     * @param {number} validityMinutes 
     * @param {string} ticketType 
     * @returns {TicketInfoPresentation}
     */
    static mapTicketInfoToPresentation(title, zones, startStop, validityMinutes, ticketType) {
        return new TicketInfoPresentation(
            title,
            zones,
            startStop,
            validityMinutes,
            ticketType
        );
    }
    
    /**
     * Map map bounds to MapStatePresentation
     * @param {Object} center 
     * @param {number} zoom 
     * @param {MapBounds} bounds 
     * @param {Array<string>} highlightedZones 
     * @param {boolean} isLoading 
     * @returns {MapStatePresentation}
     */
    static mapToMapState(center, zoom, bounds, highlightedZones = [], isLoading = false) {
        const boundsObj = bounds ? {
            north: bounds.north,
            south: bounds.south,
            east: bounds.east,
            west: bounds.west
        } : null;
        
        return new MapStatePresentation(
            center,
            zoom,
            boundsObj,
            highlightedZones,
            isLoading
        );
    }
    
    /**
     * Get default zone style
     * @returns {Object}
     */
    static getDefaultZoneStyle() {
        return {
            fillColor: 'transparent',
            weight: 3,
            opacity: 1,
            color: '#0056b3',
            fillOpacity: 0
        };
    }
    
    /**
     * Get highlighted zone style
     * @returns {Object}
     */
    static getHighlightedZoneStyle() {
        return {
            fillColor: '#28a745',
            weight: 2,
            opacity: 0.8,
            color: '#28a745',
            fillOpacity: 0.3
        };
    }
    
    /**
     * Map GeoJSON feature to Zone entity (for repository use)
     * @param {Object} feature 
     * @returns {Zone|null}
     */
    static mapGeoJsonFeatureToZone(feature) {
        const zoneName = feature.properties?.zona;
        const geoJsonId = feature.properties?.id;
        
        if (!zoneName) {
            return null;
        }
        
        // Import Zone here to avoid circular dependency
        return import('../../../core/entities/map/Zone.js').then(module => {
            return new module.Zone(
                zoneName, // Zone code
                zoneName, // Display name
                feature.geometry,
                geoJsonId // Original GeoJSON numeric ID
            );
        });
    }
}