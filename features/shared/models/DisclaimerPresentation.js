/**
 * Presentation model for disclaimer text
 */
export class DisclaimerPresentation {
    constructor(text) {
        this.id = Math.random().toString(36).substr(2, 9); // Generate unique ID
        this.text = text;
    }
}