# Amal Frontend

A modern, multilingual web application for drug addiction awareness, prevention, and recovery support in Algeria.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Vite | 5.0.0 | Build tool & dev server |
| Tailwind CSS | 3.3.5 | Styling |
| React Router | 6.20.0 | Client-side routing |
| Zustand | 4.4.7 | State management |
| Lucide React | 0.294.0 | Icons |

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
# Clone the repository
git clone https://github.com/Samir-Guenchi/Amal.git
cd Amal/frontend

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Shared UI components
│   │   └── navigation/      # Navbar, Footer
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Authentication (login, signup, forgot password)
│   │   ├── chat/            # AI chat interface
│   │   ├── home/            # Landing page
│   │   ├── about/           # About page
│   │   └── resources/       # Educational resources
│   ├── services/            # API services
│   ├── store/               # Global state (Zustand)
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Features

- **Multilingual Support**: Arabic, French, Darija, English
- **RTL Support**: Full right-to-left layout for Arabic
- **Dark/Light Theme**: User preference persistence
- **AI Chat**: Integration with backend AI models
- **Authentication**: JWT-based auth with lazy login
- **Responsive Design**: Mobile-first approach

## API Integration

The frontend connects to the Python FastAPI backend:

- `POST /chat` - Send message to AI
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/forgot-password` - Password reset request
- `GET /auth/me` - Get current user

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Browser Support

- Chrome >= 90
- Firefox >= 90
- Safari >= 14
- Edge >= 90

## License

MIT License - See LICENSE file for details.
