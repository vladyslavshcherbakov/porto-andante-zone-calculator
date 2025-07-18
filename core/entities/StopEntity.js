/**
 * Entity representing a transport stop
 */
export class StopEntity {
    /**
     * @param {string} id - Stop ID
     * @param {string} name - Stop name
     * @param {string|null} code - Stop code
     * @param {string|null} zoneId - Zone ID
     */
    constructor(id, name, code = null, zoneId = null) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.zoneId = zoneId;
    }
}