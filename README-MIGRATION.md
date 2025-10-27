# Recipe Notes - React Migration

This project has been successfully migrated from EJS templating to a modern React frontend with TypeScript and TailwindCSS.

## 🚀 New Architecture

### Frontend (React + Vite + TypeScript + TailwindCSS)
- **Location**: `/frontend` directory
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: TailwindCSS with custom glassmorphism components
- **State Management**: React hooks (useState, useEffect)

### Backend (Express.js REST API)
- **Location**: Root directory (`api-server.js`)
- **Framework**: Express.js with CORS support
- **Database**: PostgreSQL (unchanged)
- **API**: RESTful endpoints returning JSON

## 📁 Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeForm.tsx
│   │   │   └── NotesList.tsx
│   │   ├── services/         # API service layer
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx          # Main React component
│   │   └── main.tsx         # React entry point
│   ├── tailwind.config.js   # TailwindCSS configuration
│   └── vite.config.ts       # Vite configuration with API proxy
├── api-server.js            # New REST API server
├── index.js                 # Original EJS server (kept for reference)
└── package.json             # Updated with new scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database running on localhost:5432
- Database: "Recipe" with tables: `recipes` and `notes`

### Installation

1. **Install backend dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```
This will start:
- API server on http://localhost:3000
- React dev server on http://localhost:5173

#### Option 2: Run separately

**Backend only**:
```bash
npm run api
```

**Frontend only** (in another terminal):
```bash
cd frontend
npm run dev
```

## 🔄 API Endpoints

The new REST API provides these endpoints:

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/sort?by=field` - Get recipes sorted by field
- `GET /recipes/:id` - Get single recipe
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe

### Notes
- `GET /recipes/:id/notes` - Get notes for a recipe
- `POST /recipes/:id/notes` - Create new note
- `PUT /notes/:id` - Update note

### Health Check
- `GET /health` - API health status

## 🎨 Design Features

The new frontend maintains the original design aesthetic:

- **Glassmorphism Effects**: Semi-transparent cards with backdrop blur
- **Gradient Background**: Warm gradient from #edd897 to #F6F0F0
- **Responsive Grid**: Auto-filling grid layout for recipe cards
- **Interactive Elements**: Hover effects and smooth transitions
- **Typography**: Georgia serif font for elegant appearance

## 🔧 Development

### Frontend Development
- Hot reload enabled with Vite
- TypeScript for type safety
- TailwindCSS for utility-first styling
- Component-based architecture

### Backend Development
- RESTful API design
- JSON responses
- CORS enabled for frontend communication
- Error handling with appropriate HTTP status codes

## 📊 Migration Benefits

1. **Better Developer Experience**: Hot reload, TypeScript intellisense, modern tooling
2. **Improved Performance**: Client-side routing, optimized builds
3. **Enhanced Maintainability**: Component-based architecture, type safety
4. **Modern Styling**: TailwindCSS utility classes, responsive design
5. **API-First Architecture**: Separated concerns, easier to extend

## 🚦 Next Steps

The migration is complete and ready for use! You can:

1. Start developing new features using React components
2. Add more API endpoints as needed
3. Implement additional state management (Redux, Zustand) if the app grows
4. Add testing (Jest, React Testing Library)
5. Deploy frontend and backend separately

## 📝 Notes

- Original EJS server (`index.js`) is preserved for reference
- Database schema remains unchanged
- All existing functionality has been replicated
- TheMealDB API integration is maintained
