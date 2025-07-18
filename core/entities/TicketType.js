/**
 * Andante ticket type with zone coverage and validity duration
 */
export class TicketType {
    static Z2 = new TicketType("Z2", 2, 60);
    static Z3 = new TicketType("Z3", 3, 60);
    static Z4 = new TicketType("Z4", 4, 75);
    static Z5 = new TicketType("Z5", 5, 90);
    static Z6 = new TicketType("Z6", 6, 105);
    
    constructor(rawValue, rings, validityMinutes) {
        this.rawValue = rawValue;
        this.rings = rings;
        this.validityMinutes = validityMinutes;
    }
    
    /**
     * Legacy duration property for backward compatibility
     */
    get duration() {
        return this.validityMinutes * 60 * 1000; // Convert to milliseconds
    }
    
    /**
     * Creates ticket type from number of rings needed
     * @param {number} rings - Number of rings
     * @returns {TicketType}
     */
    static forRings(rings) {
        const clampedRings = Math.max(rings, 2); // Minimum is Z2
        switch (clampedRings) {
            case 2: return TicketType.Z2;
            case 3: return TicketType.Z3;
            case 4: return TicketType.Z4;
            case 5: return TicketType.Z5;
            case 6: return TicketType.Z6;
            default: return TicketType.Z6; // Max is Z6
        }
    }
    
    static get allCases() {
        return [TicketType.Z2, TicketType.Z3, TicketType.Z4, TicketType.Z5, TicketType.Z6];
    }
}