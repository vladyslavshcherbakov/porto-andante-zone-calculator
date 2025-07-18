import { ZoneCalcResultDTO } from './ZoneCalcResultDTO.js';

/**
 * Use case for computing zones crossed between two stops on a route
 * 
 * ## Business Logic Documentation
 * 
 * ### Route Direction Handling
 * - Routes have TWO directions (0 and 1) representing opposite travel directions
 * - Each direction has its own stop sequence and may have different stop IDs for the same physical locations
 * - Algorithm examines BOTH directions to find the one where start→finish travel is possible
 * 
 * ### Stop ID Business Rules
 * - **Terminal/endpoint stops**: May share the same ID across directions (same physical platform)
 * - **Intermediate stops**: Usually have different IDs for opposite directions (different platforms/sides)
 * - **Example**: Route 1 has PASS (direction 0 endpoint) and PASS2 (direction 1 startpoint) - both "Passeio Alegre"
 * 
 * ### Direction Selection Algorithm
 * 1. Filter all route directions by routeId (examines both direction 0 and 1)
 * 2. For each direction, check if both stops exist AND start comes before finish in sequence
 * 3. Use the first valid direction found (startIndex < finishIndex)
 * 4. This automatically selects the correct travel direction without requiring explicit direction input
 * 
 * ### Zone Calculation
 * - Extracts unique zones from the stop sequence between start and finish (inclusive)
 * - Preserves zone order as encountered along the route
 * - Returns zones that will be crossed during the journey for ticket calculation
 */
export class ComputeZonesUseCase {
    
    /**
     * @param {RouteRepository} repo - Route repository
     * @param {ZoneGraphRepository} graphRepo - Zone graph repository
     */
    constructor(repo, graphRepo) {
        this.repo = repo;
        this.graphRepo = graphRepo;
    }
    
    /**
     * Calculates zones crossed between two stops on a route
     * @param {ZoneCalcInputDTO} input - Input containing start/finish stops and route ID
     * @returns {Promise<ZoneCalcResultDTO>} Result with zones crossed and count
     */
    async execute(input) {
        // Get both directions for the route (direction 0 and 1)
        const allDirections = await this.repo.fetchAllRoutes();
        const directions = allDirections.filter(d => d.id.routeId === input.routeId);
        
        // Find the direction where start→finish travel is possible
        // Note: This automatically handles route direction selection without requiring explicit direction input
        for (const direction of directions) {
            const startIndex = direction.stops.findIndex(stop => stop.id === input.start.id);
            const finishIndex = direction.stops.findIndex(stop => stop.id === input.finish.id);
            
            if (startIndex !== -1 && finishIndex !== -1 && startIndex < finishIndex) {
                // Extract stop sequence for the journey
                const stopsSlice = direction.stops.slice(startIndex, finishIndex + 1);
                
                // Get unique zones in the order they appear along the route
                const sortedUniqueZones = [];
                for (const stop of stopsSlice) {
                    if (stop.zoneId && !sortedUniqueZones.includes(stop.zoneId)) {
                        sortedUniqueZones.push(stop.zoneId);
                    }
                }
                
                return new ZoneCalcResultDTO(sortedUniqueZones, sortedUniqueZones.length);
            }
        }
        
        throw new Error(`No direction covers both stops in order`);
    }
}