/**
 * Settings view for app configuration
 */
export class SettingsView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.showZones = localStorage.getItem('showZones') === 'true';
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="settings">
                <h2>Settings</h2>
                
                <div class="settings-section">
                    <h3>Display Options</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="showZonesToggle" ${this.showZones ? 'checked' : ''}>
                            Show Zone Information
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Help</h3>
                    <div class="setting-item">
                        <button id="faqBtn" class="help-btn">
                            ❓ FAQ & Support
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const showZonesToggle = this.container.querySelector('#showZonesToggle');
        const faqBtn = this.container.querySelector('#faqBtn');
        
        showZonesToggle?.addEventListener('change', (e) => {
            this.showZones = e.target.checked;
            localStorage.setItem('showZones', this.showZones);
            
            // Update zone calculator if it exists
            if (window.zoneCalculator) {
                window.zoneCalculator.showZones = this.showZones;
                window.zoneCalculator.render();
            }
        });
        
        faqBtn?.addEventListener('click', () => {
            this.showFAQ();
        });
    }
    
    showFAQ() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Help & FAQ</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="faq-section">
                        <h4>About This App</h4>
                        
                        <div class="faq-item">
                            <h5>Is this an official Andante app?</h5>
                            <p>No, this is an unofficial app created using publicly available transport data. It calculates tickets only for Blue Andante occasional tickets - not for tourist passes, monthly subscriptions, or other ticket types.</p>
                        </div>
                        
                        <div class="faq-item">
                            <h5>How does this app work?</h5>
                            <p>This app calculates which Andante ticket you need when you already know your route and stops. Unlike the official website, it can handle complex multi-segment journeys with transfers and works offline. However, if you don't know your route, the official trip planner is more convenient.</p>
                        </div>
                        
                        <div class="faq-item">
                            <h5>How do I plan my journey?</h5>
                            <p>1. Know your route number and direction<br>
                            2. Select your starting stop from that route<br>
                            3. Choose your destination stop<br>
                            4. The app shows the recommended Andante ticket type<br>
                            5. For transfers, add additional journey segments</p>
                        </div>
                        
                        <div class="faq-item">
                            <h5>What does 'Show Zone Information' setting do?</h5>
                            <p>When enabled, the app displays:<br>
                            • Zones crossed during your specific journey<br>
                            • All zones accessible with your recommended ticket<br><br>
                            This helps you understand both your route and what other areas you can reach with the same ticket.</p>
                        </div>
                    </div>
                    
                    <div class="faq-section">
                        <h4>Andante System</h4>
                        
                        <div class="faq-item">
                            <h5>What is Andante and how does it work?</h5>
                            <p>Andante is Porto's zone-based public transport system. For detailed information, visit these official pages:</p>
                            <ul>
                                <li><a href="https://andante.pt/en/plan-trip/" target="_blank">Trip Planning</a></li>
                                <li><a href="https://andante.pt/en/purchase/blue-andante/zones/" target="_blank">Zone Information</a></li>
                                <li><a href="https://andante.pt/en/purchase/blue-andante/" target="_blank">Blue Andante Tickets</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="faq-section">
                        <h4>Support</h4>
                        
                        <div class="faq-item">
                            <h5>App feedback or issues?</h5>
                            <p>Contact the app developer: <a href="mailto:support@zonecalculator.app?subject=Zone%20Calculator%20Feedback">support@zonecalculator.app</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Global instance
let settingsView = null;

// Initialize when settings tab is shown
export function initializeSettings() {
    if (!settingsView) {
        settingsView = new SettingsView('settings-container');
    }
    return settingsView;
}