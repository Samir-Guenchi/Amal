# System Implementation: User Interface and Backend Architecture

This section presents the implementation of the user-facing components of the Amal platform, including the web application, mobile application, and backend API server. These components serve as the bridge between end-users and the underlying AI models, providing accessible interfaces for drug addiction support services.

## 1. System Architecture Overview

The Amal platform follows a client-server architecture with clear separation of concerns. The system comprises three main layers:

1. **Presentation Layer**: Web and mobile clients
2. **Application Layer**: API server and orchestrator
3. **AI Layer**: Intent classification, RAG, and support models

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │   Web Frontend   │              │    Mobile Application    │ │
│  │   React + Vite   │              │   React Native + Expo    │ │
│  └────────┬─────────┘              └───────────┬──────────────┘ │
└───────────┼────────────────────────────────────┼────────────────┘
            │              REST API              │
            └──────────────────┬─────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    Backend API Server (FastAPI)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Amal Orchestrator                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │    Intent    │  │     RAG      │  │     Support      │  │ │
│  │  │  Classifier  │  │  Scientific  │  │      Model       │  │ │
│  │  │   MarBERT    │  │   ChromaDB   │  │   Qwen2.5-7B     │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 1**: Amal Platform Architecture

## 2. Backend API Server

### 2.1 Technology Selection

The backend server was implemented using FastAPI, a modern Python web framework. FastAPI was selected based on the following criteria:

1. **Performance**: FastAPI achieves performance comparable to Node.js and Go, handling over 30,000 requests per second in benchmarks. This is critical for real-time AI inference applications.

2. **Asynchronous Support**: Native async/await support enables efficient handling of concurrent requests, particularly important when multiple users simultaneously query AI models.

3. **Type Safety**: Integration with Pydantic provides automatic request validation and serialization, reducing runtime errors and improving API reliability.

4. **ML Ecosystem Compatibility**: Seamless integration with PyTorch, Transformers, and other machine learning libraries used by the AI models.

5. **Automatic Documentation**: OpenAPI (Swagger) documentation is generated automatically, facilitating frontend development and API testing.

### 2.2 API Design

The REST API exposes endpoints for chat functionality and user authentication. Table 1 summarizes the available endpoints.

**Table 1**: API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Process user message through AI pipeline |
| `/health` | GET | Server health and model status check |
| `/auth/signup` | POST | User registration |
| `/auth/login` | POST | User authentication |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password` | POST | Password reset with token |
| `/auth/refresh` | POST | Access token refresh |
| `/auth/me` | GET | Current user information |

### 2.3 Orchestrator Pattern

The core of the backend is the `AmalBackend` orchestrator class, which coordinates the flow between AI models. The query processing pipeline operates as follows:

**Algorithm 1**: Query Processing Pipeline

```
Input: User query q
Output: Response r, intent i, language l

1. l ← DetectLanguage(q)
2. i, confidence ← IntentClassifier.predict(q)
3. IF i = "Out of context" THEN
      r ← GetLocalizedRejection(l)
   ELSE IF i = "Harm" THEN
      r ← GetCrisisResponse(l)  // Includes 3033 hotline
   ELSE IF i = "Exact fact" THEN
      r ← RAGBackend.generate(q, l)
   ELSE IF i = "Looking for support" THEN
      r ← SupportModel.generate(q)
4. RETURN r, i, l
```

### 2.4 Language Detection

Given the multilingual nature of the target population, the system implements automatic language detection supporting Arabic, French, Darija (Algerian Arabic), and English. The detection algorithm analyzes the ratio of Arabic to Latin characters:

- If Arabic characters ratio > 0.7 → Arabic (ar)
- If Arabic characters ratio between 0.3 and 0.7 → Darija (dz)
- Otherwise → French or English (determined by lexical analysis)

### 2.5 Authentication System

The authentication system implements JSON Web Tokens (JWT) for stateless authentication, suitable for both web and mobile clients. Key security features include:

- Password hashing using SHA-256 with random salt
- Access tokens with 24-hour expiration
- Refresh tokens with 30-day expiration for seamless re-authentication
- Token rotation on refresh to prevent replay attacks

The system implements a "lazy login" pattern where users can access the chat functionality without authentication, reducing friction for users seeking immediate help. Authentication is optional and enables data synchronization across devices.

## 3. Web Application

### 3.1 Technology Stack

The web application was developed using React 18 with TypeScript for type safety. Table 2 presents the complete technology stack.

**Table 2**: Web Application Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | User interface library |
| TypeScript | 5.2 | Static typing |
| Vite | 5.0 | Build tool and development server |
| Tailwind CSS | 3.3 | Utility-first styling |
| React Router | 6.20 | Client-side routing |
| Zustand | 4.4 | State management |
| Lucide React | 0.294 | Icon library |

### 3.2 Framework Justification

**React** was selected for its component-based architecture enabling modular, reusable code. The virtual DOM efficiently updates only changed elements, crucial for the real-time chat interface. React's extensive ecosystem provides mature solutions for routing, state management, and internationalization.

**Vite** was chosen over Create React App for its superior development experience. Vite leverages native ES modules for instant server startup (under 300ms) and hot module replacement under 50ms, significantly improving developer productivity.

**Tailwind CSS** enables rapid UI development through utility classes while maintaining design consistency. The framework's built-in support for RTL layouts (via `rtl:` variants) and dark mode (`dark:` variants) simplified multilingual and accessibility implementation.

**Zustand** provides lightweight state management with minimal boilerplate. At 1.1KB gzipped (compared to Redux's 7KB+), it reduces bundle size while offering excellent TypeScript integration and built-in persistence middleware.

### 3.3 Application Structure

The application follows a feature-based architecture:

```
src/
├── components/          # Shared UI components
│   └── navigation/      # Navbar, Footer
├── features/            # Feature modules
│   ├── auth/           # Authentication
│   ├── chat/           # AI chat interface
│   ├── home/           # Landing page
│   └── resources/      # Educational content
├── services/           # API communication
└── store/              # Global state
```

This structure ensures separation of concerns, with each feature encapsulating its own pages, components, and state management.

### 3.4 Multilingual and RTL Support

The application supports four languages with full right-to-left (RTL) layout for Arabic scripts. Language switching dynamically updates:

- Document direction (`dir="rtl"` or `dir="ltr"`)
- Text alignment and component layouts
- Localized content and error messages

### 3.5 Chat Interface Implementation

The chat interface provides real-time communication with the AI backend. Key implementation details include:

- Optimistic UI updates for immediate user feedback
- Message streaming support for long responses
- Automatic scroll management for new messages
- Loading states and error handling with retry capability

## 4. Mobile Application

### 4.1 Technology Selection

The mobile application was developed using React Native with Expo SDK 52. This approach enables cross-platform deployment from a single codebase.

**Table 3**: Mobile Application Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.76 | Cross-platform framework |
| Expo | SDK 52 | Development platform |
| TypeScript | 5.3 | Static typing |
| React Navigation | 7.x | Native navigation |
| Zustand | 4.4 | State management |
| AsyncStorage | 1.23 | Local data persistence |

### 4.2 Cross-Platform Justification

React Native was selected over native development (Swift/Kotlin) and alternative frameworks (Flutter, Ionic) based on:

1. **Code Sharing**: Approximately 90% code sharing between Android and iOS reduces development time by 40-50%.

2. **Native Performance**: Unlike hybrid frameworks, React Native compiles to native components, providing near-native performance.

3. **Ecosystem Synergy**: Shared knowledge and libraries with the React web application accelerates development.

4. **Expo Platform**: Expo eliminates native build configuration complexity, enabling rapid prototyping and over-the-air updates.

### 4.3 Navigation Architecture

The application implements a bottom tab navigation pattern with five main screens:

1. **Home**: Landing screen with quick actions and crisis hotline
2. **Chat**: AI conversation interface
3. **Resources**: Educational content and treatment centers
4. **Settings**: Language, theme, and account preferences
5. **Auth**: Login, signup, and password recovery

React Navigation 7 provides native navigation primitives on each platform, ensuring platform-appropriate animations and gestures.

### 4.4 State Persistence

User preferences and authentication tokens are persisted using AsyncStorage with Zustand middleware. This ensures users remain authenticated across app restarts and enables offline access to cached data.

### 4.5 API Integration

The mobile application communicates with the backend via REST API. For physical device testing, the API URL must reference the development machine's IP address rather than localhost:

```javascript
// For physical device testing
const API_BASE_URL = 'http://192.168.x.x:8000';

// For Android emulator
const API_BASE_URL = 'http://10.0.2.2:8000';
```

## 5. User Interface Design Considerations

### 5.1 Target Audience

The interface was designed for users aged 20-60 in Algeria, requiring:

- Professional, non-stigmatizing visual design
- Clear typography with adequate contrast ratios
- Intuitive navigation without complex interactions
- Prominent display of crisis hotline (3033)

### 5.2 Accessibility

Both applications implement accessibility best practices:

- Semantic HTML elements and ARIA labels
- Keyboard navigation support (web)
- Screen reader compatibility
- Minimum touch target sizes of 44x44 points (mobile)
- Color contrast ratios meeting WCAG 2.1 AA standards

### 5.3 Dark Mode

Both applications support dark and light themes, persisted in user preferences. Theme switching is implemented via CSS custom properties (web) and React Native's appearance API (mobile).

## 6. Performance Optimization

### 6.1 Web Application

- **Code Splitting**: Vite automatically splits code by route, loading only necessary JavaScript
- **CSS Purging**: Tailwind removes unused styles, reducing CSS payload by over 95%
- **Asset Optimization**: Images compressed and served in modern formats (WebP)

### 6.2 Mobile Application

- **FlatList Virtualization**: Chat messages rendered using virtualized lists for memory efficiency
- **Memoization**: React.memo prevents unnecessary re-renders of static components
- **Lazy Loading**: Screens loaded on-demand to reduce initial bundle size

### 6.3 Backend

- **Model Preloading**: AI models loaded at server startup to eliminate cold-start latency
- **Async Processing**: Non-blocking request handling for concurrent users
- **CORS Configuration**: Optimized headers for cross-origin requests

## 7. Deployment Considerations

The system is designed for containerized deployment:

- **Backend**: Docker container with Python 3.10, GPU support via NVIDIA Container Toolkit
- **Frontend**: Static files served via Nginx or CDN
- **Mobile**: Distribution via Google Play Store and Apple App Store, with Expo EAS Build

## 8. Summary

This section presented the implementation of the Amal platform's user-facing components. The web application, built with React and TypeScript, provides a responsive, multilingual interface accessible from any modern browser. The mobile application, developed with React Native and Expo, extends accessibility to smartphone users across Android and iOS platforms. The FastAPI backend serves as the integration layer, orchestrating AI model inference while providing secure authentication and efficient request handling. Together, these components deliver a cohesive user experience for drug addiction support services in Algeria.

---

## References

1. Ramírez, S. (2018). FastAPI. https://fastapi.tiangolo.com

2. Meta Platforms, Inc. (2023). React: A JavaScript library for building user interfaces. https://react.dev

3. Meta Platforms, Inc. (2023). React Native: Learn once, write anywhere. https://reactnative.dev

4. Tailwind Labs. (2023). Tailwind CSS. https://tailwindcss.com

5. Expo. (2024). Expo Documentation. https://docs.expo.dev
