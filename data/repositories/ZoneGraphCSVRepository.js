import { ZoneGraphRepository } from '../../core/protocols/ZoneGraphRepository.js';
import { CSVDataSource } from '../csv/CSVDataSource.js';
import { ZoneGraph } from '../../core/entities/ZoneGraph.js';

/**
 * Repository that loads zone graph data from CSV files
 */
export class ZoneGraphCSVRepository extends ZoneGraphRepository {
    
    constructor() {
        super();
        this.csv = new CSVDataSource();
        this._cachedGraph = null;
    }
    
    /**
     * Loads the zone graph from CSV data
     * @returns {Promise<ZoneGraph>} Zone graph
     */
    async loadGraph() {
        if (this._cachedGraph) {
            return this._cachedGraph;
        }
        
        try {
            const edgesRows = await this.csv.rows('zones_edges');
            const graph = new ZoneGraph();
            
            for (const row of edgesRows) {
                const zone = row.zone;
                const neighbor = row.neighbor;
                
                if (zone && neighbor) {
                    graph.addEdge(zone, neighbor);
                }
            }
            
            this._cachedGraph = graph;
            return graph;
            
        } catch (error) {
            console.error('Error loading zone graph:', error);
            throw error;
        }
    }
}