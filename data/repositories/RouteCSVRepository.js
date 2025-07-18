import { RouteRepository } from '../../core/protocols/RouteRepository.js';
import { CSVDataSource } from '../csv/CSVDataSource.js';
import { StopEntity } from '../../core/entities/StopEntity.js';
import { RouteDirectionEntity, RouteType } from '../../core/entities/RouteDirectionEntity.js';
import { RouteDirectionID, Direction } from '../../core/entities/RouteDirectionID.js';

/**
 * Repository that loads route data from CSV files
 */
export class RouteCSVRepository extends RouteRepository {
    
    constructor() {
        super();
        this.csv = new CSVDataSource();
    }
    
    /**
     * Fetches all route directions from CSV data
     * @returns {Promise<Array<RouteDirectionEntity>>} Array of route direction entities
     */
    async fetchAllRoutes() {
        try {
            // Load CSV data concurrently
            const [stopsRows, routesRows] = await Promise.all([
                this.csv.rows('stops_min'),
                this.csv.rows('routes_min')
            ]);
            
            // Build stop lookup dictionary
            const stopById = new Map();
            for (const row of stopsRows) {
                const entity = new StopEntity(
                    row.stop_id || '',
                    row.stop_name || '',
                    row.stop_code || null,
                    row.zone_id || null
                );
                stopById.set(entity.id, entity);
            }
            
            // Parse route data and build entities
            const routes = [];
            for (const route of routesRows) {
                const routeId = route.route_id;
                const shortName = route.route_short_name;
                const directionRaw = route.direction_id;
                const direction = Direction.fromRawValue(parseInt(directionRaw) || 0);
                const startId = route.start_stop_id;
                const endId = route.end_stop_id;
                const sequenceField = route.stop_sequence;
                const routeTypeRaw = route.route_type;
                const routeType = RouteType.fromRawValue(parseInt(routeTypeRaw) || 0);
                
                if (!routeId || !shortName || !directionRaw || !startId || !endId || !sequenceField || !routeTypeRaw) {
                    continue;
                }
                
                // Skip tram routes - complicated ticketing system
                // Skip rail routes - availability should be investigated
                if (routeType === RouteType.Tram || routeType === RouteType.Rail) {
                    continue;
                }
                
                const stopIds = sequenceField.split('|');
                const startStop = stopById.get(startId);
                const endStop = stopById.get(endId);
                
                if (!startStop || !endStop) continue;
                
                const stopsSequence = stopIds.map(id => stopById.get(id)).filter(Boolean);
                
                routes.push(new RouteDirectionEntity(
                    new RouteDirectionID(routeId, direction),
                    shortName,
                    startStop,
                    endStop,
                    stopsSequence,
                    routeType
                ));
            }
            
            // Sort by route name, then by direction
            return routes.sort((a, b) => {
                if (a.routeShortName === b.routeShortName) {
                    return a.id.direction.rawValue - b.id.direction.rawValue;
                }
                return a.routeShortName.localeCompare(b.routeShortName, undefined, { numeric: true });
            });
            
        } catch (error) {
            console.error('Error fetching routes:', error);
            throw error;
        }
    }
}