/**
 * Presentation model for route collection
 */
export class RouteCollectionPresentation {
    constructor(id, routeShortName, routeType, directions) {
        this.id = id;
        this.routeShortName = routeShortName;
        this.routeType = routeType;
        this.directions = directions;
    }
    
    /**
     * Check if this collection is equal to another
     * @param {RouteCollectionPresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this collection
     * @returns {string}
     */
    hashCode() {
        return this.id;
    }
}

/**
 * Presentation model for route direction
 */
export class RouteDirectionPresentation {
    constructor(id, direction, startStopName, endStopName, stops) {
        this.id = id;
        this.direction = direction;
        this.startStopName = startStopName;
        this.endStopName = endStopName;
        this.stops = stops;
    }
    
    /**
     * Check if this direction is equal to another
     * @param {RouteDirectionPresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this direction
     * @returns {string}
     */
    hashCode() {
        return this.id;
    }
}