/**
 * Result of ticket calculation with zone coverage information
 */
export class TicketCalculationResult {
    /**
     * @param {Array<string>} coveredZones - Zones that will be covered during the journey
     * @param {TicketType} ticketType - Recommended ticket type for this journey
     * @param {Set<string>} allowedZones - All zones accessible with this ticket from the start zone
     * @param {Array<string>} zonePath - Path of zones from start to end
     */
    constructor(coveredZones, ticketType, allowedZones, zonePath) {
        this.id = Math.random().toString(36).substr(2, 9); // Generate unique ID
        this.coveredZones = coveredZones;
        this.ticketType = ticketType;
        this.allowedZones = allowedZones;
        this.zonePath = zonePath;
    }
    
    /**
     * Number of zones covered
     * @returns {number}
     */
    get coveredZonesCount() {
        return this.coveredZones.length;
    }
    
    /**
     * Check equality with another result
     * @param {TicketCalculationResult} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
}