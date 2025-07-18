/**
 * Data Transfer Object for zone calculation input
 */
export class ZoneCalcInputDTO {
    /**
     * @param {StopEntity} start - Starting stop
     * @param {StopEntity} finish - Destination stop
     * @param {string} routeId - Route ID
     */
    constructor(start, finish, routeId) {
        this.start = start;
        this.finish = finish;
        this.routeId = routeId;
    }
}