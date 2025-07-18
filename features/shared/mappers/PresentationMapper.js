import { RoutePresentation, StopPresentation, RouteTypePresentation, TicketPresentation, RouteGroupPresentation } from '../models/RoutePresentation.js';
import { RouteCollectionPresentation, RouteDirectionPresentation } from '../models/RouteCollectionPresentation.js';
import { JourneySegmentPresentation } from '../models/JourneySegmentPresentation.js';
import { DisclaimerPresentation } from '../models/DisclaimerPresentation.js';
import { RouteType } from '../../../core/entities/RouteDirectionEntity.js';

/**
 * Maps domain entities to presentation models
 */
export class PresentationMapper {
    
    /**
     * Maps RouteDirectionEntity to RoutePresentation
     * @param {RouteDirectionEntity} entity
     * @returns {RoutePresentation}
     */
    static mapRoute(entity) {
        const routeType = PresentationMapper.mapRouteType(entity.routeType);
        
        return new RoutePresentation(
            entity.id.stringValue,
            entity.routeShortName,
            entity.startStop.name,
            entity.endStop.name,
            routeType.title,
            routeType.icon,
            entity.stops.map(PresentationMapper.mapStop)
        );
    }
    
    /**
     * Maps StopEntity to StopPresentation
     * @param {StopEntity} entity
     * @returns {StopPresentation}
     */
    static mapStop(entity) {
        return new StopPresentation(
            entity.id,
            entity.name,
            entity.code
        );
    }
    
    /**
     * Maps RouteDirectionEntity.RouteType to RouteTypePresentation
     * @param {RouteType} entityType
     * @returns {RouteTypePresentation}
     */
    static mapRouteType(entityType) {
        switch (entityType) {
            case RouteType.Metro: return RouteTypePresentation.Metro;
            case RouteType.Bus: return RouteTypePresentation.Bus;
            case RouteType.Rail: return RouteTypePresentation.Rail;
            case RouteType.Tram: return RouteTypePresentation.Tram;
            default: return RouteTypePresentation.Bus;
        }
    }
    
    /**
     * Maps TicketCalculationResult to TicketPresentation
     * @param {TicketCalculationResult} entity
     * @returns {TicketPresentation}
     */
    static mapTicket(entity) {
        return new TicketPresentation(
            entity.ticketType.rawValue,
            entity.ticketType.validityMinutes,
            entity.coveredZonesCount,
            entity.zonePath.join(' → '),
            Array.from(entity.allowedZones).sort().join(', ')
        );
    }
    
    /**
     * Maps RouteGroup to RouteGroupPresentation
     * @param {RouteGroup} entity
     * @returns {RouteGroupPresentation}
     */
    static mapRouteGroup(entity) {
        return new RouteGroupPresentation(
            PresentationMapper.mapRouteType(entity.routeType),
            entity.routeCollections.map(PresentationMapper.mapRouteCollection)
        );
    }
    
    /**
     * Maps RouteCollection to RouteCollectionPresentation
     * @param {RouteCollection} entity
     * @returns {RouteCollectionPresentation}
     */
    static mapRouteCollection(entity) {
        return new RouteCollectionPresentation(
            entity.routeShortName,
            entity.routeShortName,
            PresentationMapper.mapRouteType(entity.routeType),
            entity.directions.map(PresentationMapper.mapRouteDirection)
        );
    }
    
    /**
     * Maps RouteDirectionEntity to RouteDirectionPresentation
     * @param {RouteDirectionEntity} entity
     * @returns {RouteDirectionPresentation}
     */
    static mapRouteDirection(entity) {
        return new RouteDirectionPresentation(
            entity.id.stringValue,
            entity.id.direction,
            entity.startStop.name,
            entity.endStop.name,
            entity.stops.map(PresentationMapper.mapStop)
        );
    }
    
    /**
     * Maps JourneySegment to JourneySegmentPresentation
     * @param {JourneySegment} entity
     * @returns {JourneySegmentPresentation}
     */
    static mapJourneySegment(entity) {
        return new JourneySegmentPresentation(
            entity.startStop.id,
            entity.endStop.id,
            entity.startStop.name,
            entity.endStop.name
        );
    }
    
    /**
     * Maps disclaimer strings to DisclaimerPresentation array
     * @param {Array<string>} disclaimers
     * @returns {Array<DisclaimerPresentation>}
     */
    static mapDisclaimers(disclaimers) {
        return disclaimers.map(disclaimer => new DisclaimerPresentation(disclaimer));
    }
    
    /**
     * Maps RouteDirectionPresentation to RoutePresentation
     * @param {RouteDirectionPresentation} direction
     * @param {RouteTypePresentation} routeType
     * @returns {RoutePresentation}
     */
    static mapRouteFromDirection(direction, routeType) {
        return new RoutePresentation(
            direction.id,
            direction.id.split('_')[0] || '',
            direction.startStopName,
            direction.endStopName,
            routeType.title,
            routeType.icon,
            direction.stops
        );
    }
}