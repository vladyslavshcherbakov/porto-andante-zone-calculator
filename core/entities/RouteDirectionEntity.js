/**
 * Route type enum - following GTFS standard
 */
export class RouteType {
    static Tram = new RouteType(0, "Tram");
    static Metro = new RouteType(1, "Metro");
    static Rail = new RouteType(2, "Rail");
    static Bus = new RouteType(3, "Bus");
    
    constructor(rawValue, name) {
        this.rawValue = rawValue;
        this.name = name;
    }
    
    static fromRawValue(rawValue) {
        switch (rawValue) {
            case 0: return RouteType.Tram;
            case 1: return RouteType.Metro;
            case 2: return RouteType.Rail;
            case 3: return RouteType.Bus;
            default: return RouteType.Bus;
        }
    }
}

/**
 * Entity representing a route direction with stops
 */
export class RouteDirectionEntity {
    /**
     * @param {RouteDirectionID} id - Route direction ID
     * @param {string} routeShortName - Route short name
     * @param {StopEntity} startStop - Start stop
     * @param {StopEntity} endStop - End stop
     * @param {Array<StopEntity>} stops - Array of stops
     * @param {RouteType} routeType - Route type
     */
    constructor(id, routeShortName, startStop, endStop, stops, routeType) {
        this.id = id;
        this.routeShortName = routeShortName;
        this.startStop = startStop;
        this.endStop = endStop;
        this.stops = stops;
        this.routeType = routeType;
    }
}