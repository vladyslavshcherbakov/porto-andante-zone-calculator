/**
 * CSV Data Source for loading and parsing CSV files
 */
export class CSVDataSource {
    
    /**
     * Loads CSV data from a file path
     * @param {string} fileName - The CSV file name
     * @returns {Promise<Array<Object>>} Array of row objects
     */
    async rows(fileName) {
        try {
            const response = await fetch(`./resources/${fileName}.txt`);
            if (!response.ok) {
                throw new Error(`Failed to load ${fileName}: ${response.status}`);
            }
            
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error(`Error loading CSV file ${fileName}:`, error);
            throw error;
        }
    }
    
    /**
     * Parses CSV text into array of objects
     * @param {string} csvText - The CSV text to parse
     * @returns {Array<Object>} Array of row objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = values[j] ? values[j].trim() : null;
            }
            
            rows.push(row);
        }
        
        return rows;
    }
}