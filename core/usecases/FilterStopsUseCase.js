import { RouteGroup, RouteCollection } from '../entities/RouteGroup.js';
import { RouteType } from '../entities/RouteDirectionEntity.js';

/**
 * Use case for filtering and grouping route stops
 */
export class FilterStopsUseCase {
    
    /**
     * Groups and sorts routes by transport type
     * @param {Array<RouteDirectionEntity>} routes - Routes to group
     * @returns {Array<RouteGroup>} Grouped routes
     */
    groupAndSort(routes) {
        // Group by route type
        const routesByType = new Map();
        
        for (const route of routes) {
            if (!routesByType.has(route.routeType)) {
                routesByType.set(route.routeType, []);
            }
            routesByType.get(route.routeType).push(route);
        }
        
        // Convert to RouteGroup objects
        const routeGroups = [];
        for (const [routeType, routesOfType] of routesByType) {
            const routeCollections = this.groupRoutesByShortName(routesOfType);
            routeGroups.push(new RouteGroup(routeType, routeCollections));
        }
        
        // Sort by route type priority
        return routeGroups.sort((a, b) => {
            const priorities = {
                1: 0, // Metro
                0: 1, // Tram
                3: 2, // Bus
                2: 3  // Rail
            };
            return priorities[a.routeType.rawValue] - priorities[b.routeType.rawValue];
        });
    }
    
    /**
     * Groups routes by short name
     * @param {Array<RouteDirectionEntity>} routes - Routes to group
     * @returns {Array<RouteCollection>} Route collections
     */
    groupRoutesByShortName(routes) {
        const routesByName = new Map();
        
        for (const route of routes) {
            if (!routesByName.has(route.routeShortName)) {
                routesByName.set(route.routeShortName, []);
            }
            routesByName.get(route.routeShortName).push(route);
        }
        
        const routeCollections = [];
        for (const [routeShortName, routesOfName] of routesByName) {
            const routeType = routesOfName[0].routeType;
            const sortedRoutes = routesOfName.sort((a, b) => 
                a.id.direction.rawValue - b.id.direction.rawValue
            );
            routeCollections.push(new RouteCollection(routeShortName, routeType, sortedRoutes));
        }
        
        // Sort collections by route short name
        return routeCollections.sort((a, b) => 
            a.routeShortName.localeCompare(b.routeShortName, undefined, { numeric: true })
        );
    }
    
    /**
     * Filters route collections by search term
     * @param {Array<RouteGroup>} routeGroups - Route groups to filter
     * @param {string} searchTerm - Search term
     * @returns {Array<RouteGroup>} Filtered route groups
     */
    filterCollections(routeGroups, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return routeGroups;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filteredGroups = [];
        
        for (const group of routeGroups) {
            const filteredCollections = [];
            
            for (const collection of group.routeCollections) {
                const filteredDirections = [];
                
                for (const direction of collection.directions) {
                    const hasMatchingStop = direction.stops.some(stop => 
                        stop.name.toLowerCase().includes(lowerSearchTerm) ||
                        (stop.code && stop.code.toLowerCase().includes(lowerSearchTerm))
                    );
                    
                    if (hasMatchingStop || collection.routeShortName.toLowerCase().includes(lowerSearchTerm)) {
                        filteredDirections.push(direction);
                    }
                }
                
                if (filteredDirections.length > 0) {
                    filteredCollections.push(
                        new RouteCollection(collection.routeShortName, collection.routeType, filteredDirections)
                    );
                }
            }
            
            if (filteredCollections.length > 0) {
                filteredGroups.push(new RouteGroup(group.routeType, filteredCollections));
            }
        }
        
        return filteredGroups;
    }
}