# Architecture Overview

## Overview

This is a React Native health and safety application built with Expo Router, designed for incident reporting, real-time communication, and safety management. The app uses a file-based routing system with GraphQL for data fetching, React Context for state management, and React Native Paper for UI components.

**App Name**: Control Acción v2  
**Platform**: React Native (iOS & Android) via Expo  
**Backend**: GraphQL API (MongoDB Atlas)  
**State Management**: React Context API + Apollo Client  
**UI Framework**: React Native Paper (Material Design)

---

## Technology Stack

### Core Framework
- **React Native**: 0.74.5
- **Expo**: ^51.0.39
- **Expo Router**: ~3.5.24 (file-based routing)

### State Management & Data
- **Apollo Client**: 3.8.8 (GraphQL client)
- **React Context API**: Global state management
- **AsyncStorage**: Local data persistence
- **apollo-upload-client**: File uploads via GraphQL

### UI & Navigation
- **React Native Paper**: ~5.12.5 (Material Design components)
- **React Navigation**: ~6.1.17 (Drawer navigation)
- **@gorhom/bottom-sheet**: 5.1.6 (Bottom sheet modals)
- **@expo/vector-icons**: ~14.0.2 (Icons)

### Media & Permissions
- **expo-camera**: ~15.0.16 (Camera access)
- **expo-image-picker**: ~15.1.0 (Image selection)
- **expo-av**: ~14.0.7 (Audio/Video)
- **expo-location**: ~17.0.1 (GPS)
- **expo-notifications**: ~0.28.19 (Push notifications)
- **@react-native-voice/voice**: ~3.2.4 (Voice recognition)

### Forms & Validation
- **Formik**: ~2.2.9 (Form management)
- **Yup**: ~1.1.1 (Schema validation)
- **react-hook-form**: ~7.51.5 (Alternative form handling)

### Internationalization
- **i18next**: 25.2.1
- **react-i18next**: 15.5.3

### Firebase
- **@react-native-firebase/app**: 21.11.0
- **@react-native-firebase/messaging**: 21.11.0

---

## Routing Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router's file-based routing system where file structure determines routes:

```
app/
├── index.jsx                    # Root redirect to login
├── _layout.jsx                  # Root layout with providers
├── (auth)/                      # Auth route group
│   ├── _layout.jsx             # Stack navigator for auth
│   └── login/
│       └── index.jsx           # Login screen
└── (drawer)/                    # Main app route group
    ├── _layout.jsx             # Drawer navigator
    ├── home/
    │   ├── _layout.jsx         # Stack navigator
    │   ├── index.jsx          # Home dashboard
    │   └── [event].jsx        # Dynamic event detail
    ├── report/
    │   ├── index.jsx           # Report main screen
    │   ├── new/[index].jsx    # New event form
    │   ├── newvoice/[index].jsx # Voice report
    │   └── searchEvent/[index].jsx # Event search
    ├── chat/
    │   ├── index.jsx           # Chat list
    │   └── [chatScreen].jsx   # Individual chat
    ├── profile/
    │   └── [index].jsx        # User profile
    └── settings/
        └── index.jsx           # Settings screen
```

### Route Groups

1. **`(auth)`**: Authentication flow
   - Uses Stack navigator
   - Contains login screen
   - Redirects to drawer on success

2. **`(drawer)`**: Main application
   - Uses Drawer navigator
   - Contains all authenticated screens
   - Custom drawer component

### Navigation Flow

```
App Start
  ↓
app/index.jsx (Redirect to /(auth)/login)
  ↓
Login Screen
  ↓ (on success)
app/(drawer)/home (Dashboard)
  ↓
Drawer Navigation:
  - Home (Dashboard)
  - Report (Event reporting)
  - Chat (Messaging)
  - Settings (Sectors management)
  - Profile (Hidden from drawer, accessible via navigation)
```

---

## Context Provider Hierarchy

The app uses a nested provider structure in `app/_layout.jsx`:

```javascript
ThemeProviderCustom (outermost)
  ↓
I18nextProvider (i18n)
  ↓
DataProvider (Global app state)
  ↓
ApolloProvider (GraphQL client)
  ↓
PaperProvider (Material Design theme)
  ↓
NavigationThemeProvider (Navigation theme)
  ↓
Slot (Expo Router outlet)
```

### Provider Details

1. **ThemeProviderCustom** (`globals/styles/ThemeContext.js`)
   - Manages light/dark theme
   - Persists theme to AsyncStorage
   - Provides theme colors to Paper and Navigation

2. **I18nextProvider** (`i18n/index.js`)
   - Internationalization (English/Spanish)
   - RTL support
   - Language persistence

3. **DataProvider** (`context/DataContext.js`)
   - Global app state (user data, login status, etc.)
   - Simple key-value state management
   - Used for cross-component communication

4. **ApolloProvider** (`context/apolloClient.js`)
   - GraphQL client configuration
   - Authentication token injection
   - Cache management

5. **PaperProvider** (React Native Paper)
   - Material Design component theming
   - Receives theme from ThemeContext

6. **NavigationThemeProvider** (React Navigation)
   - Navigation bar theming
   - Receives theme from ThemeContext

---

## Apollo Client Configuration

### Setup (`context/apolloClient.js`)

```javascript
ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})
```

### Features

1. **Authentication Link**: Automatically injects JWT token from AsyncStorage
2. **Upload Link**: Supports file uploads via `apollo-upload-client`
3. **Cache**: InMemoryCache (no persistence configured)
4. **API Endpoint**: Configurable via `API_URL_GQL` in `globals/variables/globalVariables.js`

### Token Management

- Token stored in AsyncStorage under key `'token'`
- Token format: `BEARER {token}`
- Token fetched on every request via `setContext` link
- No automatic token refresh mechanism

### Cache Strategy

- **Default**: `InMemoryCache` with no persistence
- **Fetch Policies**:
  - Most queries use `'network-only'` (bypasses cache)
  - Some use `'cache-and-network'` (e.g., `useMe` hook)
  - No cache-first strategies observed

**Issue**: No cache persistence means data is lost on app restart, requiring full refetch.

---

## State Management Patterns

### 1. Context API (`DataContext`)

**Location**: `context/DataContext.js`

```javascript
const userDefault = {
  nickName: '',
  password: '',
  idDevice: '',
  userToken: '',
  idUser: '',
  loged: false,
  idCompany: '',
  companyName: '',
  fabView: true,
  userToChat: '',
  newMsg: '',
  theme: ''
}
```

**Usage**: Global app state shared across components

**Issues**:
- No state normalization
- Flat object structure
- No type safety
- Potential performance issues with frequent updates

### 2. Apollo Client Cache

**Usage**: GraphQL query results caching

**Issues**:
- No cache persistence
- Inconsistent fetch policies
- No cache normalization strategy
- Cache not properly invalidated on mutations

### 3. AsyncStorage

**Usage**: 
- Token storage
- Theme preference
- Language preference
- General data caching (`CTRLA_GENERAL_DATA`)

**Pattern**: Custom hook `useAsyncStorage` in `context/hooks/ticketNewQH.js`

**Issues**:
- No encryption for sensitive data
- No size limits
- Synchronous access patterns in some places

---

## Data Flow Patterns

### Authentication Flow

```
User enters credentials
  ↓
Formik validation
  ↓
Login mutation (GraphQL)
  ↓
Token stored in AsyncStorage
  ↓
DataContext updated (loged: true)
  ↓
Redirect to /(drawer)/home
```

### Data Fetching Flow

```
Component mounts
  ↓
Custom hook called (e.g., useMe)
  ↓
Apollo useQuery/useLazyQuery
  ↓
GraphQL request with auth token
  ↓
Response cached in Apollo
  ↓
Component re-renders with data
```

### Real-time Updates

**Pattern**: Polling (not subscriptions)

- Chat: `pollInterval: 5000` (5 seconds)
- Home dashboard: Custom polling via `WatchNewTickets` and `WatchNewValues`
- No GraphQL subscriptions used

**Issues**:
- Battery drain from constant polling
- Unnecessary network requests
- No optimization for background/foreground states

---

## Internationalization (i18n)

### Setup (`i18n/index.js`)

- **Languages**: English (en), Spanish (es)
- **Namespaces**: common, donutCharts, position, banner, overview, settings, chat, report
- **Storage**: Language preference in AsyncStorage
- **RTL Support**: Configured but not actively used (no RTL languages)

### Translation Files

Located in `i18n/translations/`:
- `common/` - Shared translations
- `home/` - Dashboard translations
- `settings/` - Settings translations
- `chat/` - Chat translations
- `report/` - Report translations

---

## AsyncStorage Usage Patterns

### Data Caching Strategy

The app uses AsyncStorage for:

1. **Authentication Token** (`'token'`)
   - Stored on login
   - Retrieved on every GraphQL request
   - Cleared on logout

2. **General Data Cache** (`'CTRLA_GENERAL_DATA'`)
   - Stores user data, company data, dropdown options
   - Used by `useAsyncStorage` hook
   - Populated by `WatchNewValues` component
   - Refreshed periodically

3. **Theme Preference** (`'theme'`)
   - 'light' or 'dark'
   - Loaded on app start

4. **Language Preference** (`'language'`)
   - 'en' or 'es'
   - Loaded on app start

**Issues**:
- No data expiration strategy
- No cache invalidation mechanism
- Potential for stale data
- No size management

---

## Component Architecture

### Screen Components

Located in `app/(drawer)/` and `app/(auth)/`:
- Each route has an `index.jsx` or `[param].jsx` file
- Screens use custom hooks for data fetching
- Screens compose smaller components

### Reusable Components

Located in `globals/components/`:
- Form components (`forms/`)
- UI components (drawer, indicators, etc.)
- Feature-specific components (chat, events, etc.)

### Feature Components

Located in feature-specific directories:
- `app/(drawer)/home/components/` - Dashboard components
- `app/(drawer)/report/Components/` - Report components
- `app/(drawer)/chat/components/` - Chat components

---

## Custom Hooks Pattern

### Location: `context/hooks/`

All custom hooks follow a pattern:
- GraphQL queries defined with `gql` template literal
- Hook exports function starting with `use`
- Returns data, loading state, or error strings

### Hook Structure

```javascript
export const useHookName = () => {
  const { loading, error, data } = useQuery(query, options)
  if (loading) return 'Loading...'
  if (error) return 'Error! ${error}'
  return data?.field || {}
}
```

**Issues**:
- Inconsistent return types (objects vs strings)
- No proper error objects
- Loading states as strings
- No TypeScript for type safety

---

## Build & Configuration

### Expo Configuration (`app.json`)

- **Bundle ID**: `com.humberju.controlaccionv2`
- **Version**: 1.0.0
- **Orientation**: Default (portrait/landscape)
- **Updates**: Enabled with EAS
- **Plugins**: expo-router, expo-av, Firebase, expo-build-properties

### Environment Variables

**API URLs** (`globals/variables/globalVariables.js`):
- Multiple hardcoded URLs in array
- Selected via array index (fragile)
- No environment-based configuration

**Issues**:
- Hardcoded API URLs
- No environment variable support
- Manual URL switching required

---

## Critical Architecture Issues

### 1. No Cache Persistence
- Apollo cache is in-memory only
- Data lost on app restart
- Requires full refetch on every launch

### 2. Inconsistent State Management
- Mix of Context API, Apollo cache, and AsyncStorage
- No clear data flow patterns
- Potential for state synchronization issues

### 3. Polling Instead of Subscriptions
- Real-time features use polling
- Battery and bandwidth inefficient
- No background/foreground optimization

### 4. No Error Boundaries
- No global error handling
- Errors can crash entire app
- No error recovery mechanisms

### 5. Dead Code
- Extensive commented-out code blocks
- Multiple layout file versions commented
- No code cleanup

### 6. No Type Safety
- Entire app is JavaScript
- No PropTypes or TypeScript
- Runtime errors from type mismatches

### 7. Inconsistent Error Handling
- Some components return error strings
- Others throw errors
- No standardized error handling pattern

### 8. Magic Strings/Numbers
- Hardcoded values throughout codebase
- No constants file for shared values
- Difficult to maintain

---

## Dependencies

### What This Architecture Depends On

1. **Backend GraphQL API**
   - MongoDB Atlas database
   - GraphQL schema
   - Authentication endpoints
   - File upload endpoints

2. **Firebase**
   - Push notifications (FCM)
   - Device token management

3. **Expo Services**
   - OTA updates
   - Build services (EAS)

### What Depends on This Architecture

- All feature modules depend on Context providers
- All screens depend on routing structure
- All data fetching depends on Apollo Client
- All UI components depend on React Native Paper theme

---

## Performance Considerations

### Current Issues

1. **No Code Splitting**: Entire app loads at once
2. **No Lazy Loading**: All routes loaded upfront
3. **Excessive Re-renders**: Context updates trigger full tree re-renders
4. **No Memoization**: Components re-render unnecessarily
5. **Large Bundle Size**: All dependencies included

### Optimization Opportunities

1. Implement React.memo for expensive components
2. Use useMemo/useCallback for computed values
3. Implement code splitting for routes
4. Add FlatList virtualization for long lists
5. Optimize image loading and caching
6. Implement proper cache strategies

---

## Security Considerations

### Current Implementation

1. **Token Storage**: AsyncStorage (not encrypted)
2. **API Communication**: HTTP (not HTTPS in some cases)
3. **Input Validation**: Formik + Yup schemas
4. **Character Filtering**: Manual filtering in login

### Security Issues

1. **Unencrypted Token Storage**: Tokens stored in plain text
2. **No Token Refresh**: Tokens don't expire/refresh
3. **HTTP Allowed**: Some API endpoints allow HTTP
4. **No Certificate Pinning**: Vulnerable to MITM attacks

---

## Scalability Concerns

### Current Limitations

1. **State Management**: Context API doesn't scale well
2. **Cache Strategy**: No cache normalization
3. **Component Structure**: Deep nesting, no clear boundaries
4. **Code Organization**: Mixed patterns, no clear architecture

### Recommendations

1. Consider state management library (Zustand, Redux Toolkit)
2. Implement proper cache normalization
3. Refactor to feature-based structure
4. Establish clear architectural patterns
5. Add TypeScript for type safety
6. Implement proper error boundaries

---

## Summary

The app has a solid foundation with Expo Router and Apollo Client, but suffers from:

- **Inconsistent patterns** across the codebase
- **Performance issues** from polling and re-renders
- **No type safety** leading to runtime errors
- **Dead code** reducing maintainability
- **Security concerns** with token storage

The architecture is functional but needs refactoring for:
- Better state management
- Improved performance
- Type safety
- Code quality
- Security hardening

