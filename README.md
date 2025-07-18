# Porto Andante Zone Calculator

A web application for calculating the right Andante ticket for your journey in Porto's public transport system.

## 🚀 Live Demo

Visit the live application: [Porto Andante Zone Calculator](https://vladyslavshcherbakov.github.io/porto-andante-zone-calculator/)

## 📱 Features

- **Zone Calculator**: Calculate optimal tickets for single or multi-segment journeys
- **Interactive Map**: Visual zone display with Leaflet integration
- **Zone Highlighting**: Highlight specific zones for ticket visualization
- **Route Selection**: Browse Metro and Bus routes with hierarchical navigation
- **Recent Routes**: Quick access to recently used routes
- **Ticket Information**: Display ticket details with zone coverage
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Settings**: Toggle zone display and access help information

## 🛠️ Technology Stack

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Maps**: Leaflet.js for interactive zone visualization
- **Architecture**: Clean Architecture with MVVM pattern
- **Data**: CSV files with GTFS-compatible transport data + GeoJSON for zone boundaries
- **Deployment**: GitHub Pages

## 🏗️ Architecture

The application follows Clean Architecture principles:

- **Core Layer**: Entities (Zone, ZoneCollection, RouteGroup, etc.), Use Cases, Protocols
- **Data Layer**: CSV repositories for routes and zone data, GeoJSON repository for zone boundaries
- **Features Layer**: Presentation models, ViewModels, Views (including MapView with Leaflet integration)
- **Shared Layer**: Common utilities and mappers

### Map Feature Architecture

The map feature implements Clean Architecture with:

- **Entities**: `Zone`, `ZoneCollection`, `MapBounds` - Domain models for geographic zones
- **Repository**: `ZoneGeoJSONRepository` - Data access for zone boundaries  
- **ViewModel**: `MapViewModel` - Business logic and state management
- **View**: `MapView` - Leaflet integration and UI handling
- **Presentation Models**: `MapStatePresentation`, `TicketInfoPresentation` - View-specific data structures

## 📊 Data Sources

- Route data from Porto's public transport system
- Zone graph for ticket calculation
- GTFS-compatible route types and stops
- GeoJSON zone boundaries for map visualization (`resources/zAndante.geojson`)

## 🚀 Local Development

1. Clone the repository
2. Start a local HTTP server (required for ES6 modules):
   ```bash
   # Use the provided script
   ./run-local.sh
   
   # Or manually start a server
   python3 -m http.server 8000
   # or
   npx serve .
   ```
3. Open http://localhost:8000 in your browser

## 🧮 Usage

1. **Select Starting Point**: Choose your departure stop
2. **Select Destination**: Choose your arrival stop
3. **Add More Journeys**: Add additional segments for complex trips
4. **Get Recommendations**: View optimal ticket options with zone visualization
5. **View on Map**: Click on ticket recommendations to see zone coverage on the interactive map
6. **Settings**: Configure display preferences

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interface
- Collapsible navigation
- Optimized modal dialogs
- Mobile-first design

## 🔧 Configuration

The application supports various configuration options through the Settings tab:
- Toggle zone display
- Access help information
- View application information

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.