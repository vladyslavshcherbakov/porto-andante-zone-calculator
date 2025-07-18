/**
 * Presentation model for route information in UI
 */
export class RoutePresentation {
    constructor(id, routeShortName, startStopName, endStopName, routeTypeTitle, routeTypeIcon, stops) {
        this.id = id;
        this.routeShortName = routeShortName;
        this.startStopName = startStopName;
        this.endStopName = endStopName;
        this.routeTypeTitle = routeTypeTitle;
        this.routeTypeIcon = routeTypeIcon;
        this.stops = stops;
    }
    
    /**
     * Check if this route is equal to another
     * @param {RoutePresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this route
     * @returns {string}
     */
    hashCode() {
        return this.id;
    }
}

/**
 * Presentation model for stop information in UI
 */
export class StopPresentation {
    constructor(id, name, code = null) {
        this.id = id;
        this.name = name;
        this.code = code;
    }
    
    /**
     * Check if this stop is equal to another
     * @param {StopPresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this stop
     * @returns {string}
     */
    hashCode() {
        return this.id;
    }
}

/**
 * Presentation model for route type information
 */
export class RouteTypePresentation {
    static Tram = new RouteTypePresentation(0, "", ""); // Not supported
    static Metro = new RouteTypePresentation(1, "Metro", "🚇");
    static Rail = new RouteTypePresentation(2, "", ""); // Not supported
    static Bus = new RouteTypePresentation(3, "Bus", "🚌");
    
    constructor(id, title, icon) {
        this.id = id;
        this.title = title;
        this.icon = icon;
    }
    
    get sortOrder() {
        switch (this.id) {
            case 1: return 0; // Metro
            case 0: return 1; // Tram
            case 3: return 2; // Bus
            case 2: return 3; // Rail
            default: return 4;
        }
    }
    
    static get allCases() {
        return [RouteTypePresentation.Metro, RouteTypePresentation.Bus, RouteTypePresentation.Rail, RouteTypePresentation.Tram];
    }
    
    static fromId(id) {
        switch (id) {
            case 0: return RouteTypePresentation.Tram;
            case 1: return RouteTypePresentation.Metro;
            case 2: return RouteTypePresentation.Rail;
            case 3: return RouteTypePresentation.Bus;
            default: return RouteTypePresentation.Bus;
        }
    }
}

/**
 * Presentation model for ticket calculation results
 */
export class TicketPresentation {
    constructor(ticketType, validityMinutes, zonesCovered, zonePath, availableZones) {
        this.ticketType = ticketType;
        this.validityMinutes = validityMinutes;
        this.zonesCovered = zonesCovered;
        this.zonePath = zonePath;
        this.availableZones = availableZones;
    }
}

/**
 * Grouped routes by transport type for presentation
 */
export class RouteGroupPresentation {
    constructor(routeType, routeCollections) {
        this.id = routeType.id;
        this.routeType = routeType;
        this.routeCollections = routeCollections;
    }
    
    /**
     * Check if this group is equal to another
     * @param {RouteGroupPresentation} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
    
    /**
     * Get hash code for this group
     * @returns {number}
     */
    hashCode() {
        return this.id;
    }
}