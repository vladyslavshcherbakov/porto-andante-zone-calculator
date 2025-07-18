/**
 * Graph representation of zone connections for shortest path calculations
 */
export class ZoneGraph {
    constructor() {
        /** @type {Map<string, Array<string>>} */
        this.edges = new Map();
    }
    
    /**
     * Adds an undirected edge between two zones
     * @param {string} firstZone - First zone to connect
     * @param {string} secondZone - Second zone to connect
     */
    addEdge(firstZone, secondZone) {
        if (!this.edges.has(firstZone)) {
            this.edges.set(firstZone, []);
        }
        if (!this.edges.has(secondZone)) {
            this.edges.set(secondZone, []);
        }
        
        this.edges.get(firstZone).push(secondZone);
        this.edges.get(secondZone).push(firstZone);
    }
    
    /**
     * Calculates minimum number of hops between two zones using BFS
     * @param {string} start - Starting zone
     * @param {string} finish - Destination zone
     * @returns {number|null} Minimum number of hops, or null if no path exists
     */
    minHops(start, finish) {
        const visitedZones = new Set([start]);
        const queue = [[start, 0]];
        
        while (queue.length > 0) {
            const [currentZone, distance] = queue.shift();
            if (currentZone === finish) return distance;
            
            const neighbors = this.edges.get(currentZone) || [];
            for (const neighbor of neighbors) {
                if (!visitedZones.has(neighbor)) {
                    visitedZones.add(neighbor);
                    queue.push([neighbor, distance + 1]);
                }
            }
        }
        return null;
    }
    
    /**
     * Finds all zones within a given number of rings from a starting zone
     * @param {number} rings - Number of rings to expand (inclusive)
     * @param {string} start - Starting zone
     * @returns {Set<string>} Set of all zones within the specified rings
     */
    zonesWithinRings(rings, start) {
        const visited = new Set([start]);
        let currentLevel = new Set([start]);
        
        // Expand ring by ring
        for (let i = 1; i < rings; i++) {
            const nextLevel = new Set();
            for (const zone of currentLevel) {
                const neighbors = this.edges.get(zone) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        nextLevel.add(neighbor);
                    }
                }
            }
            currentLevel = nextLevel;
            for (const zone of currentLevel) {
                visited.add(zone);
            }
        }
        
        return visited;
    }
    
    /**
     * Finds the shortest path between two zones using BFS
     * @param {string} start - Starting zone
     * @param {string} end - Destination zone
     * @returns {Array<string>} Array of zones representing the path, or empty if no path exists
     */
    pathBetween(start, end) {
        const queue = [[start, [start]]];
        const visited = new Set([start]);
        
        while (queue.length > 0) {
            const [currentZone, path] = queue.shift();
            
            if (currentZone === end) {
                return path;
            }
            
            const neighbors = this.edges.get(currentZone) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, [...path, neighbor]]);
                }
            }
        }
        
        return []; // No path found
    }
}