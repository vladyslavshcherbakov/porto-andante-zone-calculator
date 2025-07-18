import { MultiSegmentTicketRecommendation, TicketRecommendationType } from '../entities/MultiSegmentTicketRecommendation.js';

/**
 * Use case for calculating optimal tickets for multi-segment journeys
 */
export class MultiSegmentTicketCalculatorUseCase {
    
    /**
     * @param {TicketCalculatorUseCase} ticketCalculator - Ticket calculator use case
     * @param {ZoneGraphRepository} zoneGraphRepository - Zone graph repository
     */
    constructor(ticketCalculator, zoneGraphRepository) {
        this.ticketCalculator = ticketCalculator;
        this.zoneGraphRepository = zoneGraphRepository;
    }
    
    /**
     * Calculate optimal ticket recommendation for a multi-segment journey
     * @param {MultiSegmentJourney} journey - The journey to calculate
     * @returns {Promise<MultiSegmentTicketRecommendation>} Ticket recommendation
     */
    async calculateRecommendation(journey) {
        let zoneGraph;
        try {
            zoneGraph = await this.zoneGraphRepository.loadGraph();
        } catch (error) {
            return new MultiSegmentTicketRecommendation(
                journey,
                {
                    type: TicketRecommendationType.SeparateTicketsRequired,
                    tickets: []
                },
                [],
                ["Unable to load zone graph"]
            );
        }
        
        // Calculate individual segment tickets
        const segmentResults = [];
        for (const segment of journey.segments) {
            try {
                const result = await this.ticketCalculator.calculateTicket(
                    segment.startStop,
                    segment.endStop,
                    segment.routeZones
                );
                segmentResults.push(result);
            } catch (error) {
                console.error('Error calculating segment ticket:', error);
            }
        }
        
        if (!journey.firstSegment || segmentResults.length === 0) {
            return new MultiSegmentTicketRecommendation(
                journey,
                {
                    type: TicketRecommendationType.SeparateTicketsRequired,
                    tickets: []
                },
                [],
                ["Unable to calculate ticket recommendation"]
            );
        }
        
        // Check if all segments can be covered by a single ticket
        const singleTicketAnalysis = await this.analyzeSingleTicketFeasibility(
            journey,
            segmentResults,
            zoneGraph
        );
        
        const { recommendedDisclaimers, alternativeDisclaimers } = this.generateDisclaimers(
            journey,
            singleTicketAnalysis
        );
        
        return new MultiSegmentTicketRecommendation(
            journey,
            singleTicketAnalysis.recommendation,
            recommendedDisclaimers,
            alternativeDisclaimers
        );
    }
    
    /**
     * Analyzes if a single ticket can cover all segments
     * @param {MultiSegmentJourney} journey - The journey
     * @param {Array<TicketCalculationResult>} segmentResults - Individual segment results
     * @param {ZoneGraph} zoneGraph - Zone graph
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeSingleTicketFeasibility(journey, segmentResults, zoneGraph) {
        // Calculate combined zones from all segments
        const allZones = journey.uniqueCoveredZones;
        
        const firstSegment = journey.firstSegment;
        const lastSegment = journey.lastSegment;
        
        if (!firstSegment || !firstSegment.startStop.zoneId) {
            return {
                recommendation: {
                    type: TicketRecommendationType.SeparateTicketsRequired,
                    tickets: segmentResults
                },
                allSegmentsAccessible: false,
                singleTicket: null,
                separateTickets: segmentResults
            };
        }
        
        // Calculate single ticket for all zones
        let singleResult;
        try {
            singleResult = await this.ticketCalculator.calculateTicket(
                firstSegment.startStop,
                lastSegment.endStop,
                allZones
            );
        } catch (error) {
            return {
                recommendation: {
                    type: TicketRecommendationType.SeparateTicketsRequired,
                    tickets: segmentResults
                },
                allSegmentsAccessible: false,
                singleTicket: null,
                separateTickets: segmentResults
            };
        }
        
        // Check if all segment start zones are accessible from the first zone
        const accessibleZones = zoneGraph.zonesWithinRings(
            singleResult.ticketType.rings,
            firstSegment.startStop.zoneId
        );
        
        const allSegmentsAccessible = journey.segments.every(segment => {
            const segmentStartZone = segment.startZone;
            return segmentStartZone && accessibleZones.has(segmentStartZone);
        });
        
        // Determine recommendation type based on journey count and zone accessibility
        let recommendation;
        if (journey.segments.length === 1) {
            // Single journey - just recommend the ticket
            recommendation = {
                type: TicketRecommendationType.SingleTicketRecommended,
                ticket: singleResult
            };
        } else if (allSegmentsAccessible) {
            // Multi-segment journeys - show both options
            recommendation = {
                type: TicketRecommendationType.SingleTicketWithOptions,
                singleTicket: singleResult,
                separateTickets: segmentResults
            };
        } else {
            // Zones not accessible from start - separate tickets required
            recommendation = {
                type: TicketRecommendationType.SeparateTicketsRequired,
                tickets: segmentResults
            };
        }
        
        return {
            recommendation,
            allSegmentsAccessible,
            singleTicket: singleResult,
            separateTickets: segmentResults
        };
    }
    
    /**
     * Generate disclaimers for the recommendation
     * @param {MultiSegmentJourney} journey - The journey
     * @param {Object} analysis - Analysis result
     * @returns {Object} Disclaimers object
     */
    generateDisclaimers(journey, analysis) {
        const recommendedDisclaimers = [];
        const alternativeDisclaimers = [];
        const journeyCount = journey.segments.length;
        
        switch (analysis.recommendation.type) {
            case TicketRecommendationType.SingleTicketRecommended:
                if (journeyCount > 1) {
                    recommendedDisclaimers.push(
                        `Complete all journeys within ${analysis.recommendation.ticket.ticketType.validityMinutes} minutes from first validation.`
                    );
                }
                break;
            case TicketRecommendationType.SingleTicketWithOptions:
                recommendedDisclaimers.push(
                    `Complete all journeys within ${analysis.recommendation.singleTicket.ticketType.validityMinutes} minutes from first validation.`
                );
                alternativeDisclaimers.push("For long breaks between journeys, separate tickets may be more convenient.");
                break;
            case TicketRecommendationType.SeparateTicketsRequired:
                alternativeDisclaimers.push("Separate tickets are required because some destinations are not accessible from your starting zone with a single ticket.");
                alternativeDisclaimers.push("Each journey segment requires its own ticket validation.");
                break;
        }
        
        return { recommendedDisclaimers, alternativeDisclaimers };
    }
}