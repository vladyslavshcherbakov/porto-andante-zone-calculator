/**
 * Represents a single segment of a journey
 */
export class JourneySegment {
    /**
     * @param {StopEntity} startStop - Starting stop
     * @param {StopEntity} endStop - Ending stop
     * @param {Array<string>} routeZones - Zones covered in this segment
     */
    constructor(startStop, endStop, routeZones) {
        this.startStop = startStop;
        this.endStop = endStop;
        this.routeZones = routeZones;
    }
    
    /**
     * Get the starting zone of this segment
     * @returns {string|null}
     */
    get startZone() {
        return this.startStop.zoneId;
    }
    
    /**
     * Get the ending zone of this segment
     * @returns {string|null}
     */
    get endZone() {
        return this.endStop.zoneId;
    }
}