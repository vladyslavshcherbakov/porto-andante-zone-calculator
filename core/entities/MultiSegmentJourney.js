/**
 * Represents a multi-segment journey with transfers
 */
export class MultiSegmentJourney {
    /**
     * @param {Array<JourneySegment>} segments - Journey segments
     */
    constructor(segments) {
        this.segments = segments;
    }
    
    /**
     * Get the first segment of the journey
     * @returns {JourneySegment|null}
     */
    get firstSegment() {
        return this.segments.length > 0 ? this.segments[0] : null;
    }
    
    /**
     * Get the last segment of the journey
     * @returns {JourneySegment|null}
     */
    get lastSegment() {
        return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null;
    }
    
    /**
     * Get all unique zones covered across all segments
     * @returns {Array<string>}
     */
    get uniqueCoveredZones() {
        const allZones = [];
        for (const segment of this.segments) {
            allZones.push(...segment.routeZones);
        }
        return [...new Set(allZones)];
    }
}