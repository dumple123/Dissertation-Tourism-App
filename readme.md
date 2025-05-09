# Curated Digital Mapping for Tourism

This project is a cross-platform indoor and outdoor navigation tool designed to support tourism, exploration, and campus orientation. Developed as part of a final year BSc Computer Science dissertation at Newcastle University, the application enables curated map creation, POI interaction, indoor mapping, and gamified discovery through a unified mobile and web interface.

## License

This repository is distributed for academic purposes and is not licensed for commercial use. Contact the author for permission regarding reuse or modification outside educational contexts.

## Author

**Peter Wilson**  
Newcastle University – BSc Computer Science (2025)  
Supervisor: Steve Riddle

## Project Overview

The application addresses key usability and engagement challenges present in modern digital navigation tools by integrating:
- Custom indoor mapping features
- Points of Interest (POIs) and metadata
- A progress tracking and achievement system
- Itinerary planning tools
- Offline-first functionality
- A minimal, map-focused user interface

The initial implementation focuses on the Newcastle University campus but is designed to scale to broader tourism and city-level deployments.

## Technologies Used

### Frontend

- **React Native (Expo)**: Mobile cross-platform interface (Android supported)
- **React with Mapbox GL JS**: Web interface and admin tools
- **TypeScript**: Consistent type-safe development across platforms
- **Mapbox**: Custom map rendering and geospatial data handling
- **Turf.js**: Spatial calculations for area, label logic, and snapping

### Backend

- **Node.js + Express**: REST API backend
- **PostgreSQL + Prisma ORM**: Relational database with schema-first design
- **JWT Authentication**: Secure session handling with access and refresh tokens
- **bcrypt**: Password hashing for secure credential storage

## Features

- Indoor mapping editor (web only) for creating building outlines, rooms, and floors
- POI creation with support for hidden POIs and metadata editing
- Room-based indoor navigation with accessibility indicators
- Floor-aware interior marker system (e.g. toilets, lifts, entrances)
- Itinerary list builder with add/remove functionality
- Offline support for maps and POI metadata after initial load
- Profile page showing visited locations and POI history
- Activity feed showing recently visited POIs by users
- Admin interface for managing map content and user-generated data

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL
- Mapbox API token
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tourism-mapping-app.git
   cd tourism-mapping-app
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables in `backend/.env`:

   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:

   ```bash
   npm run dev
   ```

6. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

7. Create `frontend/.env` with your Mapbox access token:

   ```bash
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

8. Run the frontend:

   ```bash
   expo start --web
   ```

To launch the Android version on a physical device or emulator:

```bash
expo start --android
```
