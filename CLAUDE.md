# Mohafez Baseet - Quran Memorization Platform

## Overview
A Quran memorization platform built with React.js (frontend) and Node.js/Express (backend). Features include full Quran text access, audio recitations, bookmarks, progress tracking, download management, dark/light mode, Arabic/English bilingual support, and JWT authentication.

## Tech Stack
- **Frontend**: React, Vite, React Router, Axios, Context API
- **Backend**: Node.js, Express, SQLite (better-sqlite3), JWT, bcryptjs
- **API Documentation**: Swagger/OpenAPI
- **Styling**: CSS with CSS variables for theming

## Project Structure
```
/backend
  /src
    server.js          - Express server setup
    db.js              - Database initialization and schema
    swagger.js         - API documentation
    /middleware
      auth.js          - JWT authentication middleware
    /routes
      auth.js          - Authentication endpoints
      bookmarks.js     - Bookmark management
      progress.js      - Memorization tracking
      downloads.js     - Download management
      stats.js         - Visitor statistics
/frontend
  /src
    /components        - Reusable UI components
    /context           - React Context (AppContext for state management)
    /locales           - i18n translations (English/Arabic)
    /pages             - Page components
    /utils             - Utility functions and constants
    App.jsx            - Main app component with routing
    main.jsx           - Entry point
```

## Key Features Implementation

### Authentication (JWT)
- **Backend**: Routes in `/backend/src/routes/auth.js`
  - `/api/auth/register` - User registration with bcrypt password hashing
  - `/api/auth/login` - Email/password login
  - `/api/auth/google` - Google OAuth integration
  - `/api/auth/profile` - Profile updates (name, password, avatar)
- **Frontend**: Context-based auth state in `/frontend/src/context/AppContext.jsx`
  - Stores user, token in localStorage
  - Automatically sets axios auth header
  - Provides login/logout/updateUser functions

### Database Schema (SQLite)
Defined in `/backend/src/db.js`:
- **users**: id, name, email, password, created_at, avatar, google_id
- **bookmarks**: id, user_id, surah_number, ayah_number, note, created_at
- **progress**: id, user_id, surah_number, memorized_ayahs, total_ayahs, updated_at
- **downloads**: id, user_id, surah_number, reciter, downloaded_at
- **site_stats**: key, value (for visitor tracking)

### API Endpoints
Documented in Swagger (`/backend/src/swagger.js`):
- **Auth**: `/api/auth/*` (register, login, google, profile)
- **Bookmarks**: `/api/bookmarks` (GET, POST, DELETE/:id)
- **Progress**: `/api/progress` (GET, POST)
- **Downloads**: `/api/downloads` (GET, POST, DELETE/:surah/:reciter)
- **Health**: `/api/health`

### Frontend State Management
Uses React Context (`AppContext`) for:
- Language (Arabic/English) with RTL/LTR support
- Theme (light/dark) with CSS variables
- User authentication state
- Bookmarks, progress, downloads data
- Methods to fetch/update all data from backend

### Quran Reading Experience
- **SurahReader**: Displays Quran pages as images in a spread format
- Page navigation with left/right arrows and page dot indicator
- Progress tracking per surah
- Audio playback with multiple reciters
- Download functionality for offline access
- Search and filtering in QuranList

## Identified Issues & Fixes Applied

### Backend Fixes
1. **Missing fetch import in auth.js** - Added `node-fetch` dependency and import
2. **Console.error in production** - Replaced with proper logging
3. **Enhanced password validation** - Added stronger password requirements
4. **Input validation improvements** - Added additional validation checks
5. **Error handling standardization** - Consistent error responses

### Frontend Fixes
1. **Hardcoded API URLs** - Changed to use relative paths (proxied via Vite)
2. **Improved loading states** - Better loading UX in API calls
3. **Enhanced error handling** - Added error boundaries and fallback UIs
4. **Toast system optimization** - Improved to prevent rapid-fire issues

### General Improvements
1. **Created CLAUDE.md** - Comprehensive project documentation
2. **Code organization** - Improved comments and structure
3. **Constants extraction** - Moved magic numbers to constants where appropriate
4. **Security enhancements** - Better validation and sanitization

## Environment Variables
Required in `.env` file:
```
PORT=5001
JWT_SECRET=your_jwt_secret_here
DB_PATH=./database.db
```

## Setup & Installation
1. Clone repository
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Create `.env` file in backend with required variables
4. Start application:
   ```bash
   bash start.sh
   ```
5. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - API Docs: http://localhost:5001/api/docs

## API Design Notes
- All authenticated endpoints require JWT in Authorization header: `Bearer <token>`
- Passwords are bcrypt hashed with salt rounds=10
- JWT expiration: 7 days
- CORS enabled for all origins (adjust for production)
- RESTful API design with consistent response formats

## Internationalization (i18n)
- Supported languages: English (en), Arabic (ar)
- Language persists in localStorage
- RTL support for Arabic language
- All UI text extracted to locale files

## Theming
- Light/Dark mode via CSS variables
- Theme preference persists in localStorage
- Customizable color scheme via CSS variables

## Mobile Responsiveness
- Responsive design for mobile devices
- Touch-friendly controls
- Adaptive layout for different screen sizes

## Future Improvements
1. Add unit and integration tests
2. Implement caching for frequently accessed data
3. Add refresh token mechanism for better security
4. Implement PWA capabilities for offline usage
5. Add social sharing features
6. Implement night mode for reading (separate from UI theme)
7. Add more reciters and audio quality options
8. Implement spaced repetition algorithm for memorization
9. Add group study/leaderboard features
10. Implement dark mode specifically for Quran reading