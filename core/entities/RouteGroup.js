/**
 * Collection of route directions grouped by route name
 */
export class RouteCollection {
    /**
     * @param {string} routeShortName - Route short name
     * @param {RouteType} routeType - Route type
     * @param {Array<RouteDirectionEntity>} directions - Route directions
     */
    constructor(routeShortName, routeType, directions) {
        this.routeShortName = routeShortName;
        this.routeType = routeType;
        this.directions = directions;
    }
}

/**
 * Group of routes by transport type
 */
export class RouteGroup {
    /**
     * @param {RouteType} routeType - Route type
     * @param {Array<RouteCollection>} routeCollections - Route collections
     */
    constructor(routeType, routeCollections) {
        this.routeType = routeType;
        this.routeCollections = routeCollections;
    }
}