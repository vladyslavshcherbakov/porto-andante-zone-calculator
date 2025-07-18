import { ZoneCalcViewModel } from './ZoneCalcViewModel.js';
import { TicketRecommendationType } from '../../core/entities/MultiSegmentTicketRecommendation.js';
import { PresentationMapper } from '../shared/mappers/PresentationMapper.js';

/**
 * View for single and multi-segment journey calculations
 */
export class ZoneCalculatorView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.viewModel = new ZoneCalcViewModel();
        this.showZones = localStorage.getItem('showZones') === 'true';
        
        this.viewModel.addListener(() => this.render());
        this.init();
    }
    
    async init() {
        await this.viewModel.load();
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="zone-calculator">
                <h2>Zone Calculator</h2>
                
                <div class="segments-container">
                    ${this.viewModel.segments.map((segment, index) => 
                        this.renderSegment(segment, index)
                    ).join('')}
                </div>
                
                ${this.viewModel.canAddSegment ? `
                    <button class="add-segment-btn" onclick="window.zoneCalculator.addSegment()">
                        Add Another Journey
                    </button>
                ` : ''}
                
                ${this.viewModel.recommendation ? this.renderRecommendation() : ''}
                
                ${this.shouldShowResetButton() ? `
                    <button class="reset-btn" onclick="window.zoneCalculator.resetAll()">
                        Reset All
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    renderSegment(segment, index) {
        const zones = this.viewModel.getZonesForSegment(segment);
        
        return `
            <div class="segment-card">
                <div class="segment-header">
                    <h3>${this.viewModel.journeyTitle(segment)}</h3>
                    ${this.viewModel.canRemoveSegment(segment) ? `
                        <button class="remove-btn" onclick="window.zoneCalculator.removeSegment('${segment.id}')">
                            Remove
                        </button>
                    ` : ''}
                </div>
                
                <div class="segment-content">
                    <div class="stop-selector">
                        <label>From:</label>
                        <button class="stop-btn ${segment.startID ? 'selected' : ''}" 
                                onclick="window.zoneCalculator.selectStartStop('${segment.id}')">
                            ${this.viewModel.startStopName(segment)}
                        </button>
                    </div>
                    
                    ${segment.startID ? `
                        <div class="stop-selector">
                            <label>To:</label>
                            <button class="stop-btn ${segment.finishID ? 'selected' : ''}" 
                                    onclick="window.zoneCalculator.selectFinishStop('${segment.id}')">
                                ${this.viewModel.finishStopName(segment)}
                            </button>
                        </div>
                    ` : ''}
                    
                    ${zones && this.showZones ? `
                        <div class="zones-display">
                            <small>Zones: ${zones.join(', ')}</small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderRecommendation() {
        const rec = this.viewModel.recommendation;
        if (!rec) return '';
        
        switch (rec.recommendation.type) {
            case TicketRecommendationType.SingleTicketRecommended:
                return this.renderSingleTicketRecommended(rec);
            case TicketRecommendationType.SingleTicketWithOptions:
                return this.renderSingleTicketWithOptions(rec);
            case TicketRecommendationType.SeparateTicketsRequired:
                return this.renderSeparateTicketsRequired(rec);
            default:
                return '';
        }
    }
    
    renderSingleTicketRecommended(rec) {
        const ticket = rec.recommendation.ticket;
        return `
            <div class="recommendation-section">
                <h3>Option 1</h3>
                ${this.renderTicketCard(ticket, 'Single ' + ticket.ticketType.rawValue + ' ticket', 'recommended')}
                ${this.renderDisclaimers(rec.recommendedDisclaimers)}
            </div>
        `;
    }
    
    renderSingleTicketWithOptions(rec) {
        const singleTicket = rec.recommendation.singleTicket;
        const separateTickets = rec.recommendation.separateTickets;
        
        return `
            <div class="recommendation-section">
                <div class="option-section">
                    <h3>Option 1</h3>
                    ${this.renderTicketCard(singleTicket, 'Single ' + singleTicket.ticketType.rawValue + ' ticket', 'recommended')}
                    ${this.renderDisclaimers(rec.recommendedDisclaimers)}
                </div>
                
                <div class="option-section">
                    <h3>Option 2</h3>
                    ${separateTickets.map((ticket, index) => 
                        this.renderTicketCard(ticket, `Journey ${index + 1}: Single ${ticket.ticketType.rawValue} ticket`, 'alternative')
                    ).join('')}
                    ${this.renderDisclaimers(rec.alternativeDisclaimers)}
                </div>
            </div>
        `;
    }
    
    renderSeparateTicketsRequired(rec) {
        const tickets = rec.recommendation.tickets;
        
        return `
            <div class="recommendation-section">
                <h3>Required Tickets</h3>
                ${tickets.map((ticket, index) => 
                    this.renderTicketCard(ticket, `Journey ${index + 1}: Single ${ticket.ticketType.rawValue} ticket`, 'alternative')
                ).join('')}
                ${this.renderDisclaimers(rec.alternativeDisclaimers)}
            </div>
        `;
    }
    
    renderTicketCard(ticket, title, type) {
        // Get journey information for context
        const firstSegment = this.viewModel.segments.find(s => s.startID && s.finishID);
        const startStopInfo = firstSegment ? `${firstSegment.startStopName}` : 'selected stop';
        
        return `
            <div class="ticket-card ${type}">
                <div class="ticket-title">${title}</div>
                <div class="ticket-info">
                    <small>Valid for ${ticket.ticketType.validityMinutes} minutes</small>
                </div>
                ${this.showZones ? `
                    <div class="ticket-zones">
                        <small>Available zones: ${Array.from(ticket.allowedZones).sort().join(', ')}</small>
                    </div>
                ` : ''}
                <button class="show-map-btn" onclick="window.zoneCalculator.showTicketOnMap('${Array.from(ticket.allowedZones).join(',')}', '${title}', '${startStopInfo}')">
                    🗺️ Show zones on map
                </button>
            </div>
        `;
    }
    
    renderDisclaimers(disclaimers) {
        if (!disclaimers || disclaimers.length === 0) return '';
        
        return `
            <div class="disclaimers">
                ${disclaimers.map(disclaimer => `
                    <div class="disclaimer">
                        <small>${disclaimer}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    shouldShowResetButton() {
        return this.viewModel.segments.length > 1 || 
               this.viewModel.segments[0].startID;
    }
    
    // Event handlers
    addSegment() {
        this.viewModel.addSegment();
    }
    
    async removeSegment(segmentId) {
        const segment = this.viewModel.segments.find(s => s.id === segmentId);
        if (segment && confirm('Are you sure you want to remove this journey?')) {
            await this.viewModel.removeSegment(segment);
        }
    }
    
    resetAll() {
        if (confirm('Are you sure you want to reset all journeys? This will clear all your current selections.')) {
            this.viewModel.resetAll();
        }
    }
    
    selectStartStop(segmentId) {
        const segment = this.viewModel.segments.find(s => s.id === segmentId);
        if (segment) {
            this.showStopPicker(segment, 'start');
        }
    }
    
    selectFinishStop(segmentId) {
        const segment = this.viewModel.segments.find(s => s.id === segmentId);
        if (segment) {
            this.showStopPicker(segment, 'finish');
        }
    }
    
    showStopPicker(segment, type) {
        // This would open a modal or navigate to stop picker
        // For now, we'll simulate with a simple prompt
        const routes = type === 'start' ? this.viewModel.allDirections : this.viewModel.dirsForFinish(segment);
        
        if (routes.length === 0) {
            alert('No routes available');
            return;
        }
        
        // Create and show stop picker modal
        this.createStopPickerModal(segment, type, routes);
    }
    
    createStopPickerModal(segment, type, routes) {
        // Get grouped routes using the proper structure
        const routeGroups = this.viewModel.filterUseCase.groupAndSort(routes);
        const presentationGroups = routeGroups.map(group => 
            PresentationMapper.mapRouteGroup(group)
        );
        
        // Get recent route for this segment
        const lastSelectedRouteId = this.viewModel.lastSelectedRouteId(segment);
        let recentRoute = null;
        
        if (lastSelectedRouteId) {
            // Find the recent route in the routes list
            const recentDirection = routes.find(r => r.id.stringValue === lastSelectedRouteId);
            if (recentDirection) {
                recentRoute = {
                    id: recentDirection.id,
                    routeShortName: recentDirection.routeShortName,
                    startStopName: recentDirection.startStop.name,
                    endStopName: recentDirection.endStop.name,
                    routeType: recentDirection.routeType,
                    stops: recentDirection.stops
                };
                
                // Remove recent route from main groups to avoid duplication
                presentationGroups.forEach(group => {
                    group.routeCollections.forEach(collection => {
                        collection.directions = collection.directions.filter(direction => 
                            direction.id !== recentDirection.id.stringValue
                        );
                    });
                    group.routeCollections = group.routeCollections.filter(collection => 
                        collection.directions.length > 0
                    );
                });
            }
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Select Stop</h3>
                    <div class="modal-header-actions">
                        <button class="help-btn-modal" onclick="window.zoneCalculator.showStopPickerHelp('${type}')" title="Help"></button>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                </div>
                <div class="modal-body">
                    <input type="text" id="stopSearch" placeholder="Search stops..." />
                    <div class="routes-list">
                        ${recentRoute ? `
                            <div class="route-type-group recent-section" data-group-id="recent">
                                <h3 onclick="window.zoneCalculator.toggleGroup('recent')">⏰ Recent</h3>
                                <div class="group-content">
                                    <div class="route-collection collapsed" data-collection-id="recent-${recentRoute.routeShortName}">
                                        <h4 onclick="window.zoneCalculator.toggleCollection('recent-${recentRoute.routeShortName}')">
                                            <div class="route-info">
                                                <div class="route-title">${recentRoute.routeShortName}</div>
                                                <div class="route-subtitle">${recentRoute.startStopName} → ${recentRoute.endStopName}</div>
                                            </div>
                                        </h4>
                                        <div class="collection-content">
                                            <div class="route-direction collapsed" data-direction-id="recent-${recentRoute.id.stringValue}">
                                                <h5 onclick="window.zoneCalculator.toggleDirection('recent-${recentRoute.id.stringValue}')">${recentRoute.startStopName} → ${recentRoute.endStopName}</h5>
                                                <div class="direction-content stops-list">
                                                    ${recentRoute.stops.map(stop => `
                                                        <button class="stop-option" onclick="window.zoneCalculator.selectStopWithRoute('${segment.id}', '${stop.id}', '${type}', '${recentRoute.id.stringValue}')">
                                                            <div class="stop-name">${stop.name}</div>
                                                            ${stop.code ? `<div class="stop-code">${stop.code}</div>` : ''}
                                                        </button>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${presentationGroups.map(group => `
                            <div class="route-type-group" data-group-id="${group.routeType.id}">
                                <h3 onclick="window.zoneCalculator.toggleGroup('${group.routeType.id}')">${group.routeType.icon} ${group.routeType.title}</h3>
                                <div class="group-content">
                                    ${group.routeCollections.map(collection => `
                                        <div class="route-collection collapsed" data-collection-id="${collection.routeShortName}">
                                            <h4 onclick="window.zoneCalculator.toggleCollection('${collection.routeShortName}')">
                                                <div class="route-info">
                                                    <div class="route-title">${collection.routeShortName}</div>
                                                    <div class="route-subtitle">${collection.directions[0]?.startStopName || ''} → ${collection.directions[0]?.endStopName || ''}</div>
                                                </div>
                                            </h4>
                                            <div class="collection-content">
                                                ${collection.directions.map(direction => `
                                                    <div class="route-direction collapsed" data-direction-id="${direction.id}">
                                                        <h5 onclick="window.zoneCalculator.toggleDirection('${direction.id}')">${direction.startStopName} → ${direction.endStopName}</h5>
                                                        <div class="direction-content stops-list">
                                                            ${direction.stops.map(stop => `
                                                                <button class="stop-option" onclick="window.zoneCalculator.selectStopWithRoute('${segment.id}', '${stop.id}', '${type}', '${direction.id}')">
                                                                    <div class="stop-name">${stop.name}</div>
                                                                    ${stop.code ? `<div class="stop-code">${stop.code}</div>` : ''}
                                                                </button>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add search functionality
        const searchInput = modal.querySelector('#stopSearch');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                // No search - collapse collections and directions only, show all groups
                modal.querySelectorAll('.route-collection, .route-direction').forEach(el => {
                    el.classList.add('collapsed');
                });
                modal.querySelectorAll('.stop-option').forEach(option => {
                    option.style.display = 'block';
                });
                modal.querySelectorAll('.route-type-group').forEach(group => {
                    group.style.display = 'block';
                });
            } else {
                // Search mode - expand matching items
                const groups = modal.querySelectorAll('.route-type-group');
                groups.forEach(group => {
                    let groupHasMatches = false;
                    
                    const collections = group.querySelectorAll('.route-collection');
                    collections.forEach(collection => {
                        let collectionHasMatches = false;
                        
                        const directions = collection.querySelectorAll('.route-direction');
                        directions.forEach(direction => {
                            let directionHasMatches = false;
                            
                            const stops = direction.querySelectorAll('.stop-option');
                            stops.forEach(stop => {
                                const text = stop.textContent.toLowerCase();
                                if (text.includes(searchTerm)) {
                                    stop.style.display = 'block';
                                    directionHasMatches = true;
                                } else {
                                    stop.style.display = 'none';
                                }
                            });
                            
                            if (directionHasMatches) {
                                direction.classList.remove('collapsed');
                                collectionHasMatches = true;
                            } else {
                                direction.classList.add('collapsed');
                            }
                        });
                        
                        if (collectionHasMatches) {
                            collection.classList.remove('collapsed');
                            groupHasMatches = true;
                        } else {
                            collection.classList.add('collapsed');
                        }
                    });
                    
                    // Show/hide entire group based on matches
                    if (groupHasMatches) {
                        group.style.display = 'block';
                        group.classList.remove('collapsed');
                    } else {
                        group.style.display = 'none';
                    }
                });
            }
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async selectStop(segmentId, stopId, type) {
        const segment = this.viewModel.segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        if (type === 'start') {
            await this.viewModel.updateStartStop(segment, stopId);
        } else {
            await this.viewModel.updateFinishStop(segment, stopId);
        }
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }
    
    async selectStopWithRoute(segmentId, stopId, type, routeId) {
        const segment = this.viewModel.segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        // Remember the selected route
        this.viewModel.setSelectedRoute(segment, routeId);
        
        if (type === 'start') {
            await this.viewModel.updateStartStop(segment, stopId);
        } else {
            await this.viewModel.updateFinishStop(segment, stopId);
        }
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }
    
    toggleGroup(groupId) {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (group) {
            group.classList.toggle('collapsed');
        }
    }
    
    toggleCollection(collectionId) {
        const collection = document.querySelector(`[data-collection-id="${collectionId}"]`);
        if (collection) {
            collection.classList.toggle('collapsed');
        }
    }
    
    toggleDirection(directionId) {
        const direction = document.querySelector(`[data-direction-id="${directionId}"]`);
        if (direction) {
            direction.classList.toggle('collapsed');
        }
    }
    
    showStopPickerHelp(type) {
        const helpText = type === 'start' 
            ? `Browse routes by transport type or use search for stop name/code. Stop codes are found at bus stops, online, or in Google Maps.

Choose your actual route and direction carefully - this determines which destination stops will be available.`
            : `Browse routes by transport type or use search for stop name/code. Stop codes are found at bus stops, online, or in Google Maps.

If you see multiple routes, it's because several routes pass through your chosen stop - select the one you plan to take.`;
        
        const helpModal = document.createElement('div');
        helpModal.className = 'modal help-modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>How to find your stop</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>${helpText.replace(/\n\n/g, '</p><p>')}</p>
                    <button class="help-ok-btn" onclick="this.closest('.modal').remove()">Got it</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Close help modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    }
    
    
    /**
     * Get zones from current recommendation
     * @returns {Array<string>} Array of zone names
     */
    getRecommendationZones() {
        if (!this.viewModel.recommendation) return [];
        
        const rec = this.viewModel.recommendation;
        let zones = [];
        
        switch (rec.recommendation.type) {
            case TicketRecommendationType.SingleTicketRecommended:
                zones = Array.from(rec.recommendation.ticket.allowedZones);
                break;
            case TicketRecommendationType.SingleTicketWithOptions:
                zones = Array.from(rec.recommendation.singleTicket.allowedZones);
                break;
            case TicketRecommendationType.SeparateTicketsRequired:
                // Combine zones from all tickets
                const allZones = new Set();
                rec.recommendation.tickets.forEach(ticket => {
                    ticket.allowedZones.forEach(zone => allZones.add(zone));
                });
                zones = Array.from(allZones);
                break;
        }
        
        // Convert zone codes to match GeoJSON format
        return zones.map(zone => this.convertZoneCodeToGeoJSON(zone));
    }
    
    /**
     * Convert internal zone codes to GeoJSON zone names
     * @param {string} zoneCode - Internal zone code
     * @returns {string} GeoJSON zone name
     */
    convertZoneCodeToGeoJSON(zoneCode) {
        // This might need adjustment based on how zones are mapped
        // For now, assume they match
        return zoneCode;
    }
    
    /**
     * Show specific ticket zones on map and switch to map tab
     * @param {string} zonesString - Comma-separated zone codes
     * @param {string} ticketDescription - Description of the ticket
     * @param {string} startStopName - Name of the starting stop
     */
    showTicketOnMap(zonesString, ticketDescription = null, startStopName = null) {
        const zones = zonesString.split(',').map(zone => this.convertZoneCodeToGeoJSON(zone.trim()));
        
        // Switch to map tab
        showTab('map');
        
        // Update map highlights after a short delay to ensure map is loaded
        setTimeout(() => {
            import('../map/MapView.js').then(module => {
                const mapView = module.getMapInstance();
                if (mapView) {
                    mapView.highlightZones(zones, ticketDescription, startStopName);
                    mapView.fitToHighlightedZones();
                }
            }).catch(() => {
                // Map not loaded yet, ignore
            });
        }, 500);
    }
}

// Global instance for event handlers
window.zoneCalculator = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zoneCalculator = new ZoneCalculatorView('zone-calculator-container');
});