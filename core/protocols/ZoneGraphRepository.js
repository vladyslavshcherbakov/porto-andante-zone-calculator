/**
 * Repository protocol for loading zone graph data
 */
export class ZoneGraphRepository {
    /**
     * Loads the zone graph
     * @returns {Promise<ZoneGraph>}
     */
    async loadGraph() {
        throw new Error('loadGraph must be implemented');
    }
}