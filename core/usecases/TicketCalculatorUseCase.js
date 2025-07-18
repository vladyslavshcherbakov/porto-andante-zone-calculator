import { TicketCalculationResult } from '../entities/TicketCalculationResult.js';
import { TicketType } from '../entities/TicketType.js';

/**
 * Use case for calculating optimal ticket and zone coverage
 */
export class TicketCalculatorUseCase {
    
    /**
     * @param {ZoneGraphRepository} graphRepo - Zone graph repository
     */
    constructor(graphRepo) {
        this.graphRepo = graphRepo;
    }
    
    /**
     * Calculates optimal ticket and zone coverage for a journey
     * @param {StopEntity} start - Starting stop
     * @param {StopEntity} end - Destination stop
     * @param {Array<string>} routeZones - Actual zones from route calculation
     * @returns {Promise<TicketCalculationResult>} Ticket calculation result with zone information
     */
    async calculateTicket(start, end, routeZones) {
        if (!start.zoneId || !end.zoneId) {
            throw new Error('Zone missing');
        }
        
        const graph = await this.graphRepo.loadGraph();
        
        // Use actual route zones count instead of graph shortest path
        const zonesCount = routeZones.length;
        
        // Calculate required rings (minimum Z2)
        const requiredRings = Math.max(zonesCount, 2);
        const ticketType = TicketType.forRings(requiredRings);
        
        // Use actual route zones path
        const zonePath = routeZones;
        
        // Calculate all zones accessible with this ticket
        const allowedZones = graph.zonesWithinRings(requiredRings, start.zoneId);
        
        return new TicketCalculationResult(
            [...new Set(zonePath)], // Remove duplicates but keep as array
            ticketType,
            allowedZones,
            zonePath
        );
    }
    
    /**
     * Calculates all zones accessible from a starting zone with given rings
     * @param {string} startZone - Starting zone
     * @param {number} rings - Number of rings (ticket level)
     * @returns {Promise<Set<string>>} Set of accessible zones
     */
    async allowedZones(startZone, rings) {
        const graph = await this.graphRepo.loadGraph();
        return graph.zonesWithinRings(rings, startZone);
    }
}