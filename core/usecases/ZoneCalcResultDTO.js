/**
 * Data Transfer Object for zone calculation result
 */
export class ZoneCalcResultDTO {
    /**
     * @param {Array<string>} zones - Zones crossed during journey
     * @param {number} zonesCount - Number of zones
     */
    constructor(zones, zonesCount) {
        this.zones = zones;
        this.zonesCount = zonesCount;
    }
}