/**
 * Direction enum for route directions
 */
export class Direction {
    static Direction0 = new Direction(0);
    static Direction1 = new Direction(1);
    
    constructor(rawValue) {
        this.rawValue = rawValue;
    }
    
    static fromRawValue(rawValue) {
        return rawValue === 0 ? Direction.Direction0 : Direction.Direction1;
    }
}

/**
 * Composite ID for route direction
 */
export class RouteDirectionID {
    /**
     * @param {string} routeId - Route ID
     * @param {Direction} direction - Direction
     */
    constructor(routeId, direction) {
        this.routeId = routeId;
        this.direction = direction;
    }
    
    /**
     * String representation for identification
     */
    get stringValue() {
        return `${this.routeId}_${this.direction.rawValue}`;
    }
    
    /**
     * Create from string representation
     * @param {string} stringValue - String representation
     * @returns {RouteDirectionID|null}
     */
    static fromString(stringValue) {
        const parts = stringValue.split('_');
        if (parts.length !== 2) return null;
        
        const routeId = parts[0];
        const directionValue = parseInt(parts[1]);
        if (isNaN(directionValue)) return null;
        
        return new RouteDirectionID(routeId, Direction.fromRawValue(directionValue));
    }
}