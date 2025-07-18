/**
 * Recommendation type for multi-segment journey tickets
 */
export class TicketRecommendationType {
    static SingleTicketRecommended = 'singleTicketRecommended';
    static SingleTicketWithOptions = 'singleTicketWithOptions';
    static SeparateTicketsRequired = 'separateTicketsRequired';
}

/**
 * Result of multi-segment journey ticket calculation
 */
export class MultiSegmentTicketRecommendation {
    /**
     * @param {MultiSegmentJourney} journey - The journey
     * @param {Object} recommendation - Recommendation with type and data
     * @param {Array<string>} recommendedDisclaimers - Disclaimers for recommended option
     * @param {Array<string>} alternativeDisclaimers - Disclaimers for alternative option
     */
    constructor(journey, recommendation, recommendedDisclaimers, alternativeDisclaimers) {
        this.journey = journey;
        this.recommendation = recommendation;
        this.recommendedDisclaimers = recommendedDisclaimers;
        this.alternativeDisclaimers = alternativeDisclaimers;
    }
    
    /**
     * Whether all segments can be covered by a single ticket zonally
     * @returns {boolean}
     */
    get canUseSingleTicket() {
        return this.recommendation.type === TicketRecommendationType.SingleTicketRecommended ||
               this.recommendation.type === TicketRecommendationType.SingleTicketWithOptions;
    }
    
    /**
     * Whether user has multiple options to consider
     * @returns {boolean}
     */
    get hasMultipleOptions() {
        return this.recommendation.type === TicketRecommendationType.SingleTicketWithOptions;
    }
}