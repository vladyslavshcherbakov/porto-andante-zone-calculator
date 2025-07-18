import { MapViewModel } from './MapViewModel.js';

/**
 * Map view for zone visualization using Leaflet with Clean Architecture.
 * 
 * Responsibilities:
 * - Integrates with Leaflet.js for map rendering
 * - Handles user interactions and UI events
 * - Renders zone boundaries and highlights
 * - Displays ticket information overlays
 * - Manages map viewport and bounds
 * 
 * Architecture:
 * - Depends only on MapViewModel for business logic
 * - Uses observer pattern to react to ViewModel state changes
 * - Handles all Leaflet-specific integration
 * - Manages DOM manipulation for ticket overlays
 * 
 * @class MapView
 */
export class MapView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.map = null;
        this.zonesLayer = null;
        this.ticketInfoOverlay = null;
        
        // Initialize ViewModel
        this.viewModel = new MapViewModel();
        this.viewModel.addListener(this.onViewModelUpdate.bind(this));
        
        this.init();
    }
    
    async init() {
        if (!this.container) return;
        
        // Initialize Leaflet map
        this.initializeLeafletMap();
        
        // Initialize ViewModel
        await this.viewModel.initialize();
    }
    
    /**
     * Initialize Leaflet map
     */
    initializeLeafletMap() {
        const state = this.viewModel.getCurrentState();
        
        this.map = L.map(this.container).setView(
            [state.center.lat, state.center.lng], 
            state.zoom
        );
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }
    
    /**
     * Handle ViewModel updates
     * @param {MapStatePresentation} state 
     * @param {TicketInfoPresentation} ticketInfo 
     */
    async onViewModelUpdate(state, ticketInfo) {
        if (!this.map) return;
        
        try {
            // Update map view if bounds changed
            if (state.bounds && state.hasHighlightedZones()) {
                this.fitToBounds(state.bounds);
            }
            
            // Update zones layer
            await this.updateZonesLayer(state);
            
            // Update ticket info overlay
            this.updateTicketInfoOverlay(ticketInfo);
            
        } catch (error) {
            console.error('MapView update error:', error);
        }
    }
    
    /**
     * Update zones layer based on state
     * @param {MapStatePresentation} state 
     */
    async updateZonesLayer(state) {
        try {
            // Remove existing zones layer
            if (this.zonesLayer) {
                this.map.removeLayer(this.zonesLayer);
            }
            
            // Get raw GeoJSON data
            const geoJsonData = await this.viewModel.getRawGeoJsonData();
            
            // Create new zones layer
            this.zonesLayer = L.geoJSON(geoJsonData, {
                style: (feature) => this.getZoneStyle(feature, state),
                onEachFeature: this.onEachZone.bind(this)
            }).addTo(this.map);
            
        } catch (error) {
            console.error('Error updating zones layer:', error);
        }
    }
    
    /**
     * Get style for zone based on current state
     * @param {Object} feature 
     * @param {MapStatePresentation} state 
     * @returns {Object}
     */
    getZoneStyle(feature, state) {
        const zoneName = feature.properties.zona;
        const isHighlighted = state.isZoneHighlighted(zoneName);
        
        if (isHighlighted) {
            return {
                fillColor: '#28a745',
                weight: 2,
                opacity: 0.8,
                color: '#28a745',
                fillOpacity: 0.3
            };
        } else {
            return {
                fillColor: 'transparent',
                weight: 3,
                opacity: 1,
                color: '#0056b3',
                fillOpacity: 0
            };
        }
    }
    
    /**
     * Handle zone feature events
     * @param {Object} feature 
     * @param {Object} layer 
     */
    onEachZone(feature, layer) {
        const zoneName = feature.properties.zona;
        layer.bindPopup(`<strong>Zone: ${zoneName}</strong>`);
    }
    
    /**
     * Update ticket info overlay
     * @param {TicketInfoPresentation} ticketInfo 
     */
    updateTicketInfoOverlay(ticketInfo) {
        // Remove existing overlay
        this.hideTicketInfo();
        
        if (ticketInfo && ticketInfo.isComplete()) {
            this.showTicketInfo(ticketInfo);
        }
    }
    
    /**
     * Show ticket information overlay
     * @param {TicketInfoPresentation} ticketInfo 
     */
    showTicketInfo(ticketInfo) {
        this.hideTicketInfo();
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'ticket-info-overlay';
        infoContainer.innerHTML = ticketInfo.getHtmlContent();
        
        this.container.appendChild(infoContainer);
        this.ticketInfoOverlay = infoContainer;
    }
    
    /**
     * Hide ticket information overlay
     */
    hideTicketInfo() {
        if (this.ticketInfoOverlay) {
            this.ticketInfoOverlay.remove();
            this.ticketInfoOverlay = null;
        }
    }
    
    /**
     * Fit map to bounds
     * @param {Object} bounds 
     */
    fitToBounds(bounds) {
        if (!bounds || !this.map) return;
        
        // Add validation to prevent NaN values
        if (isNaN(bounds.north) || isNaN(bounds.south) || isNaN(bounds.east) || isNaN(bounds.west)) {
            console.error('Invalid bounds with NaN values:', bounds);
            return;
        }
        
        const leafletBounds = L.latLngBounds(
            [bounds.south, bounds.west],
            [bounds.north, bounds.east]
        );
        
        this.map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
    
    /**
     * Highlight specific zones on the map
     * @param {Array<string>} zoneNames - Array of zone names to highlight
     * @param {string} ticketDescription - Description of the ticket for these zones
     * @param {string} startStopName - Name of the starting stop
     */
    async highlightZones(zoneNames, ticketDescription = null, startStopName = null) {
        await this.viewModel.highlightZones(
            zoneNames, 
            ticketDescription, 
            startStopName
        );
    }
    
    /**
     * Clear all zone highlights
     */
    async clearHighlights() {
        await this.viewModel.clearHighlights();
    }
    
    /**
     * Show all zones with default styling
     */
    async showAllZones() {
        await this.viewModel.showAllZones();
    }
    
    /**
     * Fit map view to highlighted zones
     */
    fitToHighlightedZones() {
        const bounds = this.viewModel.getOptimalBounds();
        if (bounds) {
            this.fitToBounds(bounds);
        }
    }
    
    /**
     * Show/hide the map
     * @param {boolean} visible
     */
    setVisible(visible) {
        if (this.container) {
            this.container.style.display = visible ? 'block' : 'none';
            if (visible && this.map) {
                // Invalidate size to fix display issues
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        }
    }
    
    /**
     * Get current ViewModel
     * @returns {MapViewModel}
     */
    getViewModel() {
        return this.viewModel;
    }
    
    /**
     * Check if map is ready
     * @returns {boolean}
     */
    isReady() {
        return this.viewModel.isReady() && this.map !== null;
    }
    
    /**
     * Destroy map and cleanup
     */
    destroy() {
        if (this.ticketInfoOverlay) {
            this.ticketInfoOverlay.remove();
        }
        
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        if (this.viewModel) {
            this.viewModel.removeListener(this.onViewModelUpdate.bind(this));
        }
    }
}

// Global instance
let mapView = null;

// Initialize map when needed
export function initializeMap() {
    if (!mapView) {
        mapView = new MapView('map-container');
    }
    return mapView;
}

// Export for global access
export function getMapInstance() {
    return mapView;
}