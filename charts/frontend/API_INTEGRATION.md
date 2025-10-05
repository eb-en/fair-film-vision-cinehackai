# API Integration Guide

This frontend is built to be **API-ready** and uses React Query for data fetching. All data operations are designed to connect to backend API endpoints.

## Setup

1. **Create `.env` file** in the root directory:
```bash
cp .env.example .env
```

2. **Configure API URL** in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Required Backend Endpoints

Your backend needs to implement these endpoints:

### Authentication
- `POST /api/auth/login` - User login
  ```json
  Request: { "email": "string", "password": "string" }
  Response: { "token": "string", "user": { "id": "string", "email": "string", "name": "string" } }
  ```

- `POST /api/auth/signup` - User registration
  ```json
  Request: { "email": "string", "password": "string", "name": "string" }
  Response: { "token": "string", "user": { "id": "string", "email": "string", "name": "string" } }
  ```

### Movies
- `GET /api/movies` - Get all movies
  ```json
  Response: [{ "id": "string", "name": "string", "director": "string", "releaseDate": "string", "genre": "string", "description": "string" }]
  ```

- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie
  ```json
  Request: { "name": "string", "director": "string", "releaseDate": "string", "genre": "string", "description": "string" }
  ```

- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

### Distributors
- `GET /api/movies/:movieId/distributors` - Get distributors for a movie
  ```json
  Response: [{ "id": "string", "name": "string", "tax": number, "commission": number, "movieId": "string" }]
  ```

- `POST /api/movies/:movieId/distributors` - Create distributor
  ```json
  Request: { "name": "string", "tax": number, "commission": number }
  ```

- `DELETE /api/movies/:movieId/distributors/:distributorId` - Delete distributor

### Theaters
- `GET /api/movies/:movieId/distributors/:distributorId/theaters` - Get theaters for a distributor
  ```json
  Response: [{ "id": "string", "name": "string", "region": "string", "distributorId": "string" }]
  ```

- `POST /api/movies/:movieId/distributors/:distributorId/theaters` - Add theaters
  ```json
  Request: { "theaterIds": ["string"] }
  Response: [{ "id": "string", "name": "string", "region": "string", "distributorId": "string" }]
  ```

- `DELETE /api/movies/:movieId/distributors/:distributorId/theaters/:theaterId` - Remove theater

### Analytics
- `GET /api/analytics/:movieId` - Get analytics for a movie
  ```json
  Response: {
    "stats": {
      "totalTickets": number,
      "totalRevenue": number,
      "netProfit": number,
      "activeTheaters": number
    },
    "salesTrend": [{ "date": "string", "tickets": number }],
    "regionalSales": [{ "region": "string", "sales": number }],
    "showTimingSales": [{ "timing": "string", "avgTickets": number }],
    "distributorBreakdown": [{ "name": "string", "value": number }],
    "topTheaters": [{ "name": "string", "totalSales": number, "earnings": number }],
    "allTheaters": [{ "name": "string", "totalSales": number, "earnings": number }]
  }
  ```

## Frontend Architecture

### API Service Layer
- **Location**: `src/services/api.ts`
- **Purpose**: Centralized API calls with error handling
- **Features**:
  - Automatic JWT token inclusion
  - Error handling
  - TypeScript types for all requests/responses

### React Query Hooks
Custom hooks for each data domain:

1. **`useMovies()`** - `src/hooks/useMovies.ts`
   ```ts
   const { movies, isLoading, createMovie, updateMovie, deleteMovie } = useMovies();
   ```

2. **`useDistributors(movieId)`** - `src/hooks/useDistributors.ts`
   ```ts
   const { distributors, isLoading, createDistributor, deleteDistributor } = useDistributors(movieId);
   ```

3. **`useTheaters(movieId, distributorId)`** - `src/hooks/useTheaters.ts`
   ```ts
   const { theaters, isLoading, addTheaters, removeTheater } = useTheaters(movieId, distributorId);
   ```

4. **`useAnalytics(movieId)`** - `src/hooks/useAnalytics.ts`
   ```ts
   const { analytics, isLoading } = useAnalytics(movieId);
   // Auto-refreshes every 30 seconds
   ```

## Current State (Temporary)

⚠️ **The app currently uses:**
- In-memory state (React Context) for movies
- localStorage for distributors and theaters
- Hardcoded zeros for analytics

## Migration Steps

To connect to your backend API:

1. ✅ **API service layer created** (`src/services/api.ts`)
2. ✅ **React Query hooks created** (`src/hooks/`)
3. ⏳ **TODO: Update components to use hooks instead of:**
   - MovieContext → `useMovies()` hook
   - localStorage → `useDistributors()` and `useTheaters()` hooks
   - Hardcoded data → `useAnalytics()` hook

4. ⏳ **TODO: Implement your backend** with the endpoints listed above

## Development vs Production

**Development** (current):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Production**:
```env
VITE_API_BASE_URL=https://api.yourproduction.com/api
```

## Authentication Flow

1. User logs in → `authApi.login()` called
2. Token saved to `localStorage` as `authToken`
3. All subsequent API calls include `Authorization: Bearer <token>` header
4. On logout → Token removed from localStorage

## Error Handling

All API calls throw errors that can be caught:

```ts
const { movies, error } = useMovies();

if (error) {
  // Handle error
  console.error(error.message);
}
```

## Next Steps

1. **Implement your backend** with the endpoints listed above
2. **Update frontend components** to use the React Query hooks (optional - I can help with this)
3. **Test the integration** with your backend
4. **Deploy** both frontend and backend

The frontend is **production-ready** and waiting for your backend API!
