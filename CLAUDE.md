# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native chat diary application built with Expo SDK 53, TypeScript, and Supabase. The app features a chat-style interface for diary entries with AI responses, emotion tracking, calendar views, and media attachments.

### Key Features
- Chat-style diary interface with real-time AI responses
- Emotion tracking and visualization on calendar
- Image attachments with Supabase Storage
- Message stock/bookmark functionality
- OGP (Open Graph Protocol) card previews for URLs
- Weekly and monthly calendar views
- Reply threading for messages

## Essential Commands

### Development
```bash
npm run dev          # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run test         # Run Jest tests in watch mode
npm run typecheck    # TypeScript type checking
npm run lint         # Biome linter with auto-fix (unsafe)
npm run fix          # Biome check and fix (safe)
npm run format       # Format code with Biome

# Run a single test file
npm test -- path/to/test.test.ts
```

### Building
```bash
npm run build:android:development  # Development APK
npm run build:android:preview      # Preview APK
npm run deploy:web                 # Export and deploy web version
```

### Database Operations
```bash
npm run generate     # Generate TypeScript types from Supabase schema
npm run migrate:up   # Push database changes to Supabase
npm run migrate:reset # Reset Supabase database (destructive)
```

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: Expo Router v5 (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query (React Query) v5
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: Google Generative AI SDK
- **Performance**: @shopify/flash-list for optimized lists

### Directory Structure
- `/src/app/` - Expo Router pages and API routes
  - `(tabs)/` - Tab navigation screens
  - `auth/` - Authentication screens
  - `api/` - API route handlers
  - `generated-summary+api.ts` - Server-side API for AI summary generation
- `/src/features/` - Feature modules with components, hooks, and contexts
  - `auth/` - Authentication logic
  - `calendar/` - Calendar functionality
  - `chat/` - Chat interface and messaging
  - `user/` - User profile management
- `/src/lib/supabase/` - Database client and API modules
- `/src/components/` - Shared UI components
- `/src/workers/ogp-api/` - Cloudflare Worker for OGP metadata (separate deployment)

### Key Patterns
1. **Feature-based organization**: Each feature has its own directory with components, hooks, and contexts
2. **Custom hooks**: Business logic is abstracted into hooks (e.g., `useChatRoomMessages`, `useSendMessage`)
3. **Typed API layer**: Supabase queries are wrapped in typed functions in `/src/lib/supabase/api/`
4. **Component composition**: Complex components are broken down into smaller, focused components
5. **Optimistic updates**: React Query mutations with optimistic updates for better UX
6. **Server-side API routes**: Expo Router API routes (`+api.ts` files) for secure operations like AI integration
7. **Authentication**: Supabase Auth with persistent session management and auto-refresh

### Database Schema
Key tables include:
- `user_profiles` - User information and settings
- `chat_rooms` - Chat room configurations
- `chat_room_messages` - Message entries
- `chat_room_message_stocks` - Saved messages
- `chat_room_message_replies` - Reply relationships
- `chat_room_user_messages` - User's personal messages

### Styling Convention
- Uses NativeWind with Tailwind classes
- Custom theme colors defined in `tailwind.config.js`
- Themed components in `/src/components/Themed/`
- Global styles in `/src/global.css`
- **Important**: Follow NativeWind v4 patterns (uses className prop, not style)
- Prefer semantic color names from the theme over hardcoded values

## Development Guidelines

### Testing Approach
- Jest with Expo preset for unit tests
- Test files should be colocated with components
- Run `npm run test` for watch mode during development

### Type Safety
- Always run `npm run typecheck` before committing
- Generate fresh types after database changes: `npm run generate`
- Use strict TypeScript settings (already configured)

### Code Quality
- Run `npm run lint` to fix linting issues automatically
- Biome handles both linting and formatting
- Import organization is automatic

### Environment Variables
- OGP Worker URL: `EXPO_PUBLIC_OGP_WORKER_URL`
- Supabase credentials configured in the client
- Use EAS for managing environment-specific builds

### Additional Development Resources
- **Cursor Rules**: The project includes Cursor IDE rules in `.cursor/rules/`
  - `global.mdc` - General development guidelines (Japanese)
  - `nativewind.mdc` - NativeWind styling conventions and best practices
- **OGP Worker**: Separate Cloudflare Worker project in `/src/workers/ogp-api/` with its own deployment process (see worker README)