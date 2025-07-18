/**
 * Repository protocol for fetching route data
 */
export class RouteRepository {
    /**
     * Fetches all route directions
     * @returns {Promise<Array<RouteDirectionEntity>>}
     */
    async fetchAllRoutes() {
        throw new Error('fetchAllRoutes must be implemented');
    }
}