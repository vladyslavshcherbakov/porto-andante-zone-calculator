/**
 * Use case for finding routes between two stops
 */
export class FindRouteUseCase {
    
    /**
     * Finds a route direction that connects two stops
     * @param {string} fromStopId - Starting stop ID
     * @param {string} toStopId - Destination stop ID
     * @param {Array<RouteDirectionEntity>} allDirections - All available route directions
     * @returns {RouteDirectionEntity} Route direction that connects the stops
     */
    execute(fromStopId, toStopId, allDirections) {
        for (const direction of allDirections) {
            const fromIndex = direction.stops.findIndex(stop => stop.id === fromStopId);
            const toIndex = direction.stops.findIndex(stop => stop.id === toStopId);
            
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                return direction;
            }
        }
        
        throw new Error(`No route found from ${fromStopId} to ${toStopId}`);
    }
}