import { JourneySegmentPresentation } from '../shared/models/JourneySegmentPresentation.js';
import { RouteCSVRepository } from '../../data/repositories/RouteCSVRepository.js';
import { ZoneGraphCSVRepository } from '../../data/repositories/ZoneGraphCSVRepository.js';
import { ComputeZonesUseCase } from '../../core/usecases/ComputeZonesUseCase.js';
import { FindRouteUseCase } from '../../core/usecases/FindRouteUseCase.js';
import { MultiSegmentTicketCalculatorUseCase } from '../../core/usecases/MultiSegmentTicketCalculatorUseCase.js';
import { TicketCalculatorUseCase } from '../../core/usecases/TicketCalculatorUseCase.js';
import { FilterStopsUseCase } from '../../core/usecases/FilterStopsUseCase.js';
import { ZoneCalcInputDTO } from '../../core/usecases/ZoneCalcInputDTO.js';
import { JourneySegment } from '../../core/entities/JourneySegment.js';
import { MultiSegmentJourney } from '../../core/entities/MultiSegmentJourney.js';

/**
 * ViewModel for single and multi-segment journey calculations
 */
export class ZoneCalcViewModel {
    constructor() {
        this.segments = [new JourneySegmentPresentation()];
        this.recommendation = null;
        this.lastSelectedRouteIds = new Map();
        this.stopById = new Map();
        this.allDirections = [];
        this.listeners = [];
        
        // Initialize repositories and use cases
        this.repo = new RouteCSVRepository();
        const graphRepo = new ZoneGraphCSVRepository();
        this.computeUC = new ComputeZonesUseCase(this.repo, graphRepo);
        this.findRouteUC = new FindRouteUseCase();
        const ticketCalculator = new TicketCalculatorUseCase(graphRepo);
        this.multiSegmentCalculator = new MultiSegmentTicketCalculatorUseCase(
            ticketCalculator,
            graphRepo
        );
        this.filterUseCase = new FilterStopsUseCase();
    }
    
    /**
     * Add a listener for state changes
     * @param {Function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    
    /**
     * Remove a listener
     * @param {Function} listener - Callback function
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    
    /**
     * Notify all listeners of state changes
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
    
    /**
     * Loads route data from repository
     */
    async load() {
        try {
            this.allDirections = await this.repo.fetchAllRoutes();
            this.stopById = new Map();
            for (const direction of this.allDirections) {
                for (const stop of direction.stops) {
                    this.stopById.set(stop.id, stop);
                }
            }
            this.notifyListeners();
        } catch (error) {
            console.error('Error loading routes:', error);
        }
    }
    
    /**
     * Add a new journey segment (only if all current segments are complete)
     */
    addSegment() {
        if (!this.allSegmentsValid) return;
        this.segments.push(new JourneySegmentPresentation());
        this.notifyListeners();
    }
    
    /**
     * Remove a journey segment
     * @param {JourneySegmentPresentation} segment
     */
    async removeSegment(segment) {
        if (this.segments.length <= 1) return;
        const index = this.segments.findIndex(s => s.id === segment.id);
        if (index > 0) {
            this.segments.splice(index, 1);
            this.lastSelectedRouteIds.delete(segment.id);
            await this.recalculateIfNeeded();
            this.notifyListeners();
        }
    }
    
    /**
     * Update start stop for a segment
     * @param {JourneySegmentPresentation} segment
     * @param {string} stopId
     */
    async updateStartStop(segment, stopId) {
        const index = this.segments.findIndex(s => s.id === segment.id);
        const stop = this.stopById.get(stopId);
        if (index === -1 || !stop) return;
        
        this.segments[index].startID = stopId;
        this.segments[index].startStopName = stop.name;
        this.segments[index].finishID = null;
        this.segments[index].finishStopName = null;
        await this.recalculateIfNeeded();
        this.notifyListeners();
    }
    
    /**
     * Update finish stop for a segment
     * @param {JourneySegmentPresentation} segment
     * @param {string} stopId
     */
    async updateFinishStop(segment, stopId) {
        const index = this.segments.findIndex(s => s.id === segment.id);
        const stop = this.stopById.get(stopId);
        if (index === -1 || !stop) return;
        
        this.segments[index].finishID = stopId;
        this.segments[index].finishStopName = stop.name;
        await this.recalculateIfNeeded();
        this.notifyListeners();
    }
    
    /**
     * Set the selected route for a specific segment
     * @param {JourneySegmentPresentation} segment
     * @param {string} routeId
     */
    setSelectedRoute(segment, routeId) {
        this.lastSelectedRouteIds.set(segment.id, routeId);
    }
    
    /**
     * Get available directions for finish stop selection for a specific segment
     * @param {JourneySegmentPresentation} segment
     * @returns {Array}
     */
    dirsForFinish(segment) {
        if (!segment.startID) return [];
        
        return this.allDirections.map(direction => {
            const fromIndex = direction.stops.findIndex(stop => stop.id === segment.startID);
            if (fromIndex === -1) return null;
            
            const remainingStops = direction.stops.slice(fromIndex + 1);
            if (remainingStops.length === 0) return null;
            
            return {
                id: direction.id,
                routeShortName: direction.routeShortName,
                startStop: direction.startStop,
                endStop: direction.endStop,
                stops: remainingStops,
                routeType: direction.routeType
            };
        }).filter(Boolean);
    }
    
    /**
     * Check if all segments are valid (have both start and finish)
     */
    get allSegmentsValid() {
        return this.segments.every(segment => 
            segment.startID && segment.finishID
        );
    }
    
    /**
     * Whether to show "Add Another Journey" button
     */
    get canAddSegment() {
        return this.allSegmentsValid && this.segments.length < 10;
    }
    
    /**
     * Returns display name for start stop
     * @param {JourneySegmentPresentation} segment
     * @returns {string}
     */
    startStopName(segment) {
        return segment.startStopName || "Select…";
    }
    
    /**
     * Returns display name for finish stop
     * @param {JourneySegmentPresentation} segment
     * @returns {string}
     */
    finishStopName(segment) {
        return segment.finishStopName || "Select…";
    }
    
    /**
     * Get last selected route ID for a segment
     * @param {JourneySegmentPresentation} segment
     * @returns {string|null}
     */
    lastSelectedRouteId(segment) {
        return this.lastSelectedRouteIds.get(segment.id) || null;
    }
    
    /**
     * Get zones for a completed segment (actual journey zones, not ticket zones)
     * @param {JourneySegmentPresentation} segment
     * @returns {Array<string>|null}
     */
    getZonesForSegment(segment) {
        const segmentIndex = this.segments.findIndex(s => s.id === segment.id);
        if (segmentIndex === -1 || !this.recommendation || 
            !this.recommendation.journey.segments[segmentIndex]) {
            return null;
        }
        
        return this.recommendation.journey.segments[segmentIndex].routeZones;
    }
    
    /**
     * Get grouped routes for display
     * @returns {Array}
     */
    getGroupedRoutes() {
        if (!this.allDirections || this.allDirections.length === 0) {
            return [];
        }
        
        const routeGroups = this.filterUseCase.groupAndSort(this.allDirections);
        return routeGroups;
    }
    
    /**
     * Get journey title for a segment
     * @param {JourneySegmentPresentation} segment
     * @returns {string}
     */
    journeyTitle(segment) {
        const index = this.segments.findIndex(s => s.id === segment.id);
        if (index === -1) return "Journey";
        
        if (this.segments.length === 1) {
            return "Journey";
        } else {
            return `Journey ${index + 1}`;
        }
    }
    
    /**
     * Check if segment can be removed (not first segment and has multiple segments)
     * @param {JourneySegmentPresentation} segment
     * @returns {boolean}
     */
    canRemoveSegment(segment) {
        const index = this.segments.findIndex(s => s.id === segment.id);
        return this.segments.length > 1 && index > 0;
    }
    
    /**
     * Reset all data to initial state
     */
    resetAll() {
        this.segments = [new JourneySegmentPresentation()];
        this.recommendation = null;
        this.lastSelectedRouteIds.clear();
        this.notifyListeners();
    }
    
    /**
     * Recalculate recommendation for completed segments
     */
    async recalculateIfNeeded() {
        const completedSegments = this.segments.filter(s => s.startID && s.finishID);
        if (completedSegments.length === 0) {
            this.recommendation = null;
            return;
        }
        
        try {
            const journeySegments = await this.buildJourneySegments();
            if (journeySegments.length === 0) {
                this.recommendation = null;
                return;
            }
            
            const journey = new MultiSegmentJourney(journeySegments);
            this.recommendation = await this.multiSegmentCalculator.calculateRecommendation(journey);
        } catch (error) {
            console.error('Error recalculating recommendation:', error);
            this.recommendation = null;
        }
    }
    
    /**
     * Build journey segments from presentation models
     * @returns {Promise<Array<JourneySegment>>}
     */
    async buildJourneySegments() {
        const journeySegments = [];
        
        for (const segmentModel of this.segments) {
            if (!segmentModel.startID || !segmentModel.finishID) continue;
            
            const start = this.stopById.get(segmentModel.startID);
            const finish = this.stopById.get(segmentModel.finishID);
            
            if (!start || !finish) continue;
            
            try {
                const selectedDirection = this.findRouteUC.execute(
                    start.id, 
                    finish.id, 
                    this.allDirections
                );
                
                const result = await this.computeUC.execute(
                    new ZoneCalcInputDTO(start, finish, selectedDirection.id.routeId)
                );
                
                journeySegments.push(new JourneySegment(
                    start,
                    finish,
                    result.zones
                ));
            } catch (error) {
                console.error('Error building journey segment:', error);
            }
        }
        
        return journeySegments;
    }
}