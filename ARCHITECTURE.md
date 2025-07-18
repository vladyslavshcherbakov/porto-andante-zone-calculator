# Architecture Documentation

## Overview

The Porto Andante Zone Calculator follows Clean Architecture principles with a layered approach that separates concerns and maintains testability. The application is built using pure JavaScript (ES6+) with no external frameworks, emphasizing simplicity and performance.

## Architecture Layers

### 1. Core Layer (`/core`)

Contains business logic and domain entities that are framework-agnostic.

#### Entities (`/core/entities`)
- **`Zone.js`**: Geographic zone entity with boundary calculations
- **`ZoneCollection.js`**: Collection of zones with filtering and bounds operations
- **`MapBounds.js`**: Map viewport bounds with geometric operations
- **`RouteGroup.js`**: Route grouping and hierarchy management
- **`StopEntity.js`**: Transit stop representation
- **`TicketType.js`**: Ticket type definitions and pricing
- **`ZoneGraph.js`**: Zone connectivity graph for routing

#### Use Cases (`/core/usecases`)
- **`ComputeZonesUseCase.js`**: Calculate zones for journey segments
- **`TicketCalculatorUseCase.js`**: Calculate optimal tickets
- **`MultiSegmentTicketCalculatorUseCase.js`**: Multi-segment journey optimization
- **`FindRouteUseCase.js`**: Route finding and selection
- **`FilterStopsUseCase.js`**: Stop filtering and search

#### Protocols (`/core/protocols`)
- **`RouteRepository.js`**: Interface for route data access
- **`ZoneGraphRepository.js`**: Interface for zone graph data access

### 2. Data Layer (`/data`)

Handles data access and external dependencies.

#### Repositories (`/data/repositories`)
- **`RouteCSVRepository.js`**: CSV-based route data access
- **`ZoneGraphCSVRepository.js`**: CSV-based zone graph data access
- **`ZoneGeoJSONRepository.js`**: GeoJSON-based zone boundary data access

#### Data Sources (`/data/csv`)
- **`CSVDataSource.js`**: Generic CSV parsing and data access utilities

### 3. Features Layer (`/features`)

Contains feature-specific presentation logic, view models, and views.

#### Zone Calculator (`/features/zone-calculator`)
- **`ZoneCalculatorView.js`**: Main calculator interface
- **`ZoneCalcViewModel.js`**: Business logic orchestration

#### Map Feature (`/features/map`)
- **`MapView.js`**: Leaflet integration and map UI
- **`MapViewModel.js`**: Map state management and business logic
- **`mappers/MapPresentationMapper.js`**: Domain-to-presentation model mapping
- **`models/MapStatePresentation.js`**: Map state presentation model
- **`models/TicketInfoPresentation.js`**: Ticket information display model
- **`models/ZonePresentation.js`**: Zone display model

#### Stop Picker (`/features/stop-picker`)
- Stop selection interface components

#### Settings (`/features/settings`)
- **`SettingsView.js`**: Application settings interface

#### Shared (`/features/shared`)
- **`mappers/PresentationMapper.js`**: Common presentation mapping utilities
- **`models/`**: Shared presentation models

## Design Patterns

### MVVM (Model-View-ViewModel)
- **Model**: Domain entities and data repositories
- **View**: UI components (MapView, ZoneCalculatorView)
- **ViewModel**: Business logic and state management (MapViewModel, ZoneCalcViewModel)

### Repository Pattern
- Abstract data access through repository interfaces
- Concrete implementations for different data sources (CSV, GeoJSON)
- Enables easy testing and data source switching

### Observer Pattern
- ViewModels notify Views of state changes
- Loose coupling between presentation layers

### Mapper Pattern
- Clean separation between domain and presentation models
- Transforms data between architectural layers

## Map Feature Architecture

The map feature demonstrates Clean Architecture principles:

```
┌─────────────────────────────────────────────────┐
│                    View Layer                   │
│  ┌─────────────────────────────────────────────┐ │
│  │            MapView.js                       │ │
│  │  - Leaflet integration                      │ │
│  │  - UI event handling                       │ │
│  │  - Zone visualization                      │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│                ViewModel Layer                  │
│  ┌─────────────────────────────────────────────┐ │
│  │           MapViewModel.js                   │ │
│  │  - State management                         │ │
│  │  - Business logic orchestration             │ │
│  │  - Observer pattern implementation          │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│                 Domain Layer                    │
│  ┌─────────────────────────────────────────────┐ │
│  │     Zone.js, ZoneCollection.js,             │ │
│  │           MapBounds.js                      │ │
│  │  - Pure business logic                      │ │
│  │  - No external dependencies                 │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│                  Data Layer                     │
│  ┌─────────────────────────────────────────────┐ │
│  │        ZoneGeoJSONRepository.js             │ │
│  │  - Data access abstraction                  │ │
│  │  - GeoJSON parsing                          │ │
│  │  - Caching mechanism                        │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Zone Highlighting Flow
1. **User Action**: User clicks ticket to highlight zones
2. **View**: MapView calls `highlightZones()` on MapViewModel
3. **ViewModel**: MapViewModel requests zones from repository
4. **Repository**: ZoneGeoJSONRepository loads and filters zone data
5. **Domain**: Zone entities calculate bounds and properties
6. **ViewModel**: MapViewModel updates state and notifies observers
7. **View**: MapView receives update and renders highlighted zones

### State Management
- ViewModels maintain application state
- State changes trigger observer notifications
- Views react to state changes and update UI
- Unidirectional data flow prevents state inconsistencies

## Key Benefits

### Testability
- Pure domain logic without external dependencies
- Repository interfaces enable easy mocking
- ViewModels can be tested independently of UI

### Maintainability
- Clear separation of concerns
- Each layer has a single responsibility
- Changes in one layer don't affect others

### Flexibility
- Easy to swap data sources (CSV → API)
- UI components can be replaced without changing business logic
- New features can be added without modifying existing code

### Performance
- Caching at repository level
- Efficient bounds calculations
- Lazy loading of map data

## File Organization

```
/core                     # Business logic and domain
  /entities              # Domain models
  /usecases             # Business use cases
  /protocols            # Repository interfaces

/data                    # Data access layer
  /repositories         # Data access implementations
  /csv                  # CSV parsing utilities

/features               # Feature-specific code
  /map                  # Map feature
    /mappers           # Presentation mappers
    /models            # Presentation models
  /zone-calculator      # Main calculator
  /stop-picker         # Stop selection
  /settings            # Application settings
  /shared              # Shared presentation code

/resources              # Static data files
/lib                    # Third-party libraries
```

## Dependencies

### External Libraries
- **Leaflet.js**: Map visualization (self-hosted)
- **No other external dependencies**

### Internal Dependencies
- Entities depend only on other entities
- Use cases depend on entities and protocols
- Repositories implement protocols and use entities
- ViewModels depend on use cases and repositories
- Views depend only on ViewModels

## Testing Strategy

### Unit Testing
- Test domain entities with pure functions
- Test use cases with mocked repositories
- Test ViewModels with mocked dependencies

### Integration Testing
- Test repository implementations with real data
- Test complete user flows

### End-to-End Testing
- Test map interactions
- Test zone calculations
- Test responsive behavior

## Performance Considerations

### Lazy Loading
- Zone data loaded only when map is accessed
- Repository caching prevents repeated data fetching

### Efficient Calculations
- Bounds calculations optimized for performance
- Zone filtering uses efficient data structures

### Memory Management
- Event listeners properly cleaned up
- Map instances destroyed when not needed

## Future Enhancements

### Potential Improvements
- Add unit tests for all layers
- Implement error boundary handling
- Add offline support with service workers
- Implement route optimization algorithms
- Add accessibility features
- Add internationalization support