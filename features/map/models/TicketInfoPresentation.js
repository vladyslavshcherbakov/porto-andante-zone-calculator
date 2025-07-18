/**
 * Presentation model for ticket information display on map
 */
export class TicketInfoPresentation {
    constructor(title, zones, startStop, validityMinutes, ticketType) {
        this.title = title;
        this.zones = zones; // Array of zone names
        this.startStop = startStop; // Stop name where journey starts
        this.validityMinutes = validityMinutes;
        this.ticketType = ticketType;
    }
    
    /**
     * Get formatted title for display
     * @returns {string}
     */
    getDisplayTitle() {
        return `🎫 ${this.title}`;
    }
    
    /**
     * Get formatted zone list
     * @returns {string}
     */
    getZoneList() {
        return this.zones.sort().join(', ');
    }
    
    /**
     * Get journey context description
     * @returns {string}
     */
    getJourneyContext() {
        if (this.startStop) {
            return `journey starting at ${this.startStop}`;
        }
        return 'selected journey';
    }
    
    /**
     * Get validity description
     * @returns {string}
     */
    getValidityDescription() {
        if (this.validityMinutes) {
            if (this.validityMinutes >= 60) {
                const hours = Math.floor(this.validityMinutes / 60);
                const minutes = this.validityMinutes % 60;
                if (minutes > 0) {
                    return `${hours}h ${minutes}m`;
                }
                return `${hours}h`;
            }
            return `${this.validityMinutes}m`;
        }
        return 'Limited time';
    }
    
    /**
     * Get complete description for display
     * @returns {string}
     */
    getDescription() {
        return `Ticket zones are determined by your ${this.getJourneyContext()}`;
    }
    
    /**
     * Check if ticket info is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.title && this.zones && this.zones.length > 0;
    }
    
    /**
     * Get HTML content for info overlay
     * @returns {string}
     */
    getHtmlContent() {
        return `
            <div class="ticket-info-content">
                <h4>${this.getDisplayTitle()}</h4>
                <p>Valid in zones: <strong>${this.getZoneList()}</strong></p>
                <p><small>${this.getDescription()}</small></p>
            </div>
        `;
    }
}