/**
 * Presentation model for a journey segment in the UI
 */
export class JourneySegmentPresentation {
    constructor(startID = null, finishID = null, startStopName = null, finishStopName = null) {
        this.id = Math.random().toString(36).substr(2, 9); // Generate unique ID
        this.startID = startID;
        this.finishID = finishID;
        this.startStopName = startStopName;
        this.finishStopName = finishStopName;
    }
    
    /**
     * Check if this segment is equal to another
     * @param {JourneySegmentPresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this segment
     * @returns {string}
     */
    hashCode() {
        return this.id;
    }
}