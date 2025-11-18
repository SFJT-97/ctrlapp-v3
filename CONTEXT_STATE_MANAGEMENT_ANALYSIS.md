# Context & State Management Analysis

## Overview

The app uses a combination of React Context API, Apollo Client cache, and AsyncStorage for state management. This creates a multi-layered state management system with no clear boundaries, leading to potential synchronization issues and performance problems.

---

## Context Providers Architecture

### Provider Hierarchy

The app establishes a nested provider structure in `app/_layout.jsx`:

```javascript
ThemeProviderCustom (outermost)
  ↓
I18nextProvider
  ↓
DataProvider
  ↓
ApolloProvider
  ↓
PaperProvider
  ↓
NavigationThemeProvider
  ↓
Slot (Expo Router)
```

**Order Matters**: Providers are nested in a specific order. Inner providers can access outer providers, but not vice versa.

---

## DataContext Analysis

### Implementation (`context/DataContext.js`)

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

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(userDefault)
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  )
}
```

### Purpose

DataContext serves as a global state store for:
- User authentication status (`loged`)
- User credentials (`nickName`, `password`)
- Device information (`idDevice`, `tokenDevice`)
- Company information (`idCompany`, `companyName`)
- UI state (`fabView`, `userToChat`, `newMsg`)
- Theme preference (`theme`)

### Usage Patterns

#### 1. Login Flow (`app/(auth)/login/index.jsx`)

```javascript
const { data, setData } = useContext(DataContext)

// On successful login
setData({
  ...values,
  loged: true,
  tokenDevice,
  idDevice: tokenDevice
})
```

**Issue**: Spreads entire form values into global state, including password.

#### 2. Chat Message Updates (`app/(drawer)/chat/components/MsgInput.jsx`)

```javascript
const { data, setData } = useContext(DataContext)

useEffect(() => {
  if (data?.newMsg !== 'new_chat' && data?.newMsg !== '') {
    setData({ ...data, newMsg: new Date().toLocaleTimeString() })
  }
}, [msg])
```

**Issue**: Updates entire context object to change one field, causing all consumers to re-render.

#### 3. Chat Screen Data Access (`app/(drawer)/chat/[chatScreen].jsx`)

```javascript
const { data } = useContext(DataContext)

useEffect(() => {
  setNewQuery(true)
  setTimeout(() => {
    setNewQuery(false)
  }, 1000 * 2)
}, [])
```

**Issue**: Reads from context but doesn't use it effectively. The `data` object is accessed but the dependency on `data.newMsg` is unclear.

### Critical Issues

#### Issue #1: Object Spread Anti-Pattern

**Problem**: Every `setData` call spreads the entire object:

```javascript
setData({ ...data, newMsg: newDate() })
```

**Impact**:
- All context consumers re-render on every update
- Performance degradation with many consumers
- Potential for stale closures

**Better Pattern**:
```javascript
// Use functional update
setData(prev => ({ ...prev, newMsg: newDate() }))
```

#### Issue #2: Password in Global State

**Problem**: Password stored in global context after login:

```javascript
setData({
  ...values,  // Includes password!
  loged: true
})
```

**Security Risk**: Password persists in memory unnecessarily.

**Fix**: Don't store password after authentication.

#### Issue #3: No State Normalization

**Problem**: Flat object structure mixes unrelated data:
- Authentication state
- User data
- UI state
- Device info

**Impact**: Difficult to reason about state updates, potential for bugs.

#### Issue #4: No Type Safety

**Problem**: No TypeScript or PropTypes to enforce structure.

**Impact**: Runtime errors from typos or incorrect property access.

#### Issue #5: Unused Properties

**Problem**: Some properties like `theme` are defined but never used (theme is managed by ThemeContext).

**Impact**: Confusion about which context manages what.

---

## UserContext Analysis

### Implementation (`context/UserContext.js`)

```javascript
const UserContext = createContext({
  nickName: '',
  password: '',
  idDevice: '',
  userToken: '',
  idUser: '',
  loged: false
})

export default UserContext
```

### Critical Issue: Unused Context

**Problem**: UserContext is defined but **never used** anywhere in the codebase.

**Evidence**:
- No `UserContext.Provider` found
- No `useContext(UserContext)` found
- DataContext duplicates all UserContext fields

**Impact**: Dead code that adds confusion.

**Recommendation**: Remove UserContext entirely or implement it properly.

---

## ThemeContext Analysis

### Implementation (`globals/styles/ThemeContext.js`)

```javascript
export const ThemeProviderCustom = ({ children }) => {
  const [themeColors, setThemeColors] = useState(LightThemeColors)
  const [themeNavColors, setThemeNavColors] = useState(LightThemeNavColors)

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme')
      if (storedTheme === 'dark') {
        setThemeColors(DarkThemeColors)
        setThemeNavColors(DarkThemeNavColors)
      }
    }
    loadTheme()
  }, [])

  const toogleTheme = async () => {
    const newTheme = themeColors.dark ? 'light' : 'dark'
    if (newTheme === 'dark') {
      setThemeColors(DarkThemeColors)
      setThemeNavColors(DarkThemeNavColors)
    } else {
      setThemeColors(LightThemeColors)
      setThemeNavColors(LightThemeNavColors)
    }
    await AsyncStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ themeColors, themeNavColors, toogleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### Purpose

Manages application theme (light/dark mode) and provides theme colors to:
- React Native Paper components
- React Navigation components

### Theme Definitions

**Location**: `globals/styles/theme.js`

- `LightThemeColors`: Material Design 3 light theme
- `DarkThemeColors`: Material Design 3 dark theme
- `LightThemeNavColors`: Navigation colors for light theme
- `DarkThemeNavColors`: Navigation colors for dark theme

### Usage

**In Root Layout** (`app/_layout.jsx`):

```javascript
function InnerApp() {
  const { themeColors, themeNavColors } = useContext(ThemeContext)
  
  return (
    <PaperProvider theme={themeColors}>
      <NavigationThemeProvider value={themeNavColors}>
        <Slot />
      </NavigationThemeProvider>
    </PaperProvider>
  )
}
```

### Issues

#### Issue #1: Typo in Function Name

**Problem**: `toogleTheme` should be `toggleTheme`.

**Impact**: Minor, but unprofessional.

#### Issue #2: Theme Detection Logic

**Problem**: Theme detection uses `themeColors.dark` property:

```javascript
const newTheme = themeColors.dark ? 'light' : 'dark'
```

**Issue**: This relies on the theme object having a `dark` property, which may not be reliable.

**Better Approach**:
```javascript
const [currentTheme, setCurrentTheme] = useState('light')

const toggleTheme = async () => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  setCurrentTheme(newTheme)
  // ... update colors
}
```

#### Issue #3: No Theme Persistence on Initial Load

**Problem**: Theme is loaded from AsyncStorage in `useEffect`, but there's a flash of default theme before it loads.

**Impact**: Brief flash of wrong theme on app start.

**Fix**: Load theme synchronously or use a loading state.

#### Issue #4: No Error Handling

**Problem**: AsyncStorage operations have no error handling.

**Impact**: Silent failures if storage is unavailable.

---

## Apollo Client State Management

### Configuration (`context/apolloClient.js`)

```javascript
const createApolloClient = () => {
  if (client) client.stop()
  
  client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  })
  
  return client
}
```

### Cache Strategy

**Current**: `InMemoryCache` with no persistence

**Fetch Policies Used**:
- `'network-only'`: Most queries (bypasses cache)
- `'cache-and-network'`: Some queries (e.g., `useMe`)

**Issues**:

1. **No Cache Persistence**: Data lost on app restart
2. **No Cache Normalization**: Objects stored as-is, no ID-based normalization
3. **Inconsistent Policies**: No clear strategy for when to use cache
4. **No Cache Updates**: Mutations don't update cache properly

### Token Management

**Implementation**:

```javascript
const getValue = async () => {
  try {
    const value = await AsyncStorage.getItem('token')
    if (value !== null) {
      return `BEARER ${value}`
    }
  } catch (error) {
    console.error('Error al obtener el token:', error)
  }
  return ''
}

const authLink = setContext(async (_, { headers }) => {
  const token = await getValue()
  return {
    credentials: 'include',
    headers: {
      ...headers,
      Authorization: token
    }
  }
})
```

**Issues**:

1. **Token Fetched on Every Request**: No caching of token
2. **No Token Refresh**: Tokens don't expire/refresh
3. **No Error Recovery**: If token fetch fails, request proceeds without auth

---

## AsyncStorage Usage Patterns

### Data Stored

1. **`'token'`**: Authentication token
2. **`'theme'`**: Theme preference ('light' or 'dark')
3. **`'language'`**: Language preference ('en' or 'es')
4. **`'CTRLA_GENERAL_DATA'`**: Cached general data (user, company, dropdowns)

### Custom Hook: `useAsyncStorage`

**Location**: `context/hooks/ticketNewQH.js`

```javascript
export function useAsyncStorage(key, defaultValue = {}) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadValue = async () => {
      setLoading(true)
      setError(null)

      try {
        const storedValue = await AsyncStorage.getItem(key)
        if (storedValue !== null) {
          try {
            const parsed = JSON.parse(storedValue)
            if (typeof parsed === 'object' && parsed !== null) {
              if (isMounted) setValue(parsed)
            } else {
              if (isMounted) setValue(defaultValue)
            }
          } catch (parseError) {
            console.error(`Error parsing stored value for key "${key}"`, parseError)
            if (isMounted) {
              setError(`Parse error for key "${key}"`)
              setValue(defaultValue)
            }
          }
        } else {
          if (isMounted) setValue(defaultValue)
        }
      } catch (storageError) {
        console.error(`Error loading key "${key}" from AsyncStorage`, storageError)
        if (isMounted) {
          setError(`Storage error for key "${key}"`)
          setValue(defaultValue)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadValue()

    return () => {
      isMounted = false
    }
  }, [key])

  return { value, loading, error }
}
```

### Issues with AsyncStorage Usage

#### Issue #1: No Encryption

**Problem**: Sensitive data (tokens) stored unencrypted.

**Security Risk**: Tokens accessible if device is compromised.

#### Issue #2: No Size Limits

**Problem**: `CTRLA_GENERAL_DATA` can grow unbounded.

**Impact**: Potential storage issues on low-storage devices.

#### Issue #3: No Expiration

**Problem**: Cached data never expires.

**Impact**: Stale data can persist indefinitely.

#### Issue #4: Synchronous Access Patterns

**Problem**: Some code accesses AsyncStorage synchronously (though this is not possible, code may assume it).

**Impact**: Potential race conditions.

---

## State Management Patterns

### Pattern 1: Context for Global State

**Used For**: Authentication, UI state, device info

**Pros**:
- Simple to use
- No external dependencies
- Built into React

**Cons**:
- Performance issues with many consumers
- No state normalization
- Difficult to debug

### Pattern 2: Apollo Cache for Server State

**Used For**: GraphQL query results

**Pros**:
- Automatic caching
- Normalization possible
- Optimistic updates possible

**Cons**:
- Not used effectively (no persistence, inconsistent policies)
- Cache not properly invalidated
- No offline support

### Pattern 3: AsyncStorage for Persistence

**Used For**: Tokens, preferences, cached data

**Pros**:
- Persists across app restarts
- Simple API

**Cons**:
- No encryption
- No expiration
- No size management

---

## State Synchronization Issues

### Problem: Multiple Sources of Truth

1. **User Data**:
   - Stored in DataContext
   - Fetched via Apollo (`useMe` hook)
   - Cached in AsyncStorage (`CTRLA_GENERAL_DATA`)

2. **Theme**:
   - Defined in DataContext (unused)
   - Managed by ThemeContext
   - Stored in AsyncStorage

3. **Authentication**:
   - `loged` flag in DataContext
   - Token in AsyncStorage
   - Apollo client configured with token

**Impact**: Potential for state to get out of sync.

---

## Performance Issues

### Issue #1: Context Re-renders

**Problem**: Every DataContext update causes all consumers to re-render.

**Example**:
```javascript
// In MsgInput component
setData({ ...data, newMsg: newDate() })
// This causes ALL components using DataContext to re-render
```

**Impact**: Unnecessary re-renders, performance degradation.

**Solution**: Split contexts or use state management library.

### Issue #2: No Memoization

**Problem**: Context values are not memoized.

**Example**:
```javascript
// Current (bad)
<DataContext.Provider value={{ data, setData }}>
  {children}
</DataContext.Provider>

// Better
const value = useMemo(() => ({ data, setData }), [data, setData])
<DataContext.Provider value={value}>
  {children}
</DataContext.Provider>
```

### Issue #3: Apollo Cache Not Used

**Problem**: Most queries use `'network-only'`, bypassing cache.

**Impact**: Unnecessary network requests, slower app.

---

## Recommendations

### Short-term Fixes

1. **Fix DataContext Updates**:
   ```javascript
   // Use functional updates
   setData(prev => ({ ...prev, newMsg: value }))
   ```

2. **Remove Password from Context**:
   ```javascript
   // Don't store password after login
   setData({
     nickName: values.nickName,
     loged: true,
     // ... other fields, but NOT password
   })
   ```

3. **Memoize Context Values**:
   ```javascript
   const value = useMemo(() => ({ data, setData }), [data])
   ```

4. **Remove UserContext**: Delete unused context.

5. **Fix Theme Toggle**: Use explicit state instead of `themeColors.dark`.

### Medium-term Improvements

1. **Split DataContext**: Separate into:
   - `AuthContext` (authentication state)
   - `UIContext` (UI state like `fabView`, `newMsg`)
   - `UserContext` (user data)

2. **Implement Apollo Cache Persistence**:
   ```javascript
   import { persistCache } from 'apollo-cache-persist'
   
   const cache = new InMemoryCache()
   await persistCache({ cache, storage: AsyncStorage })
   ```

3. **Add Cache Normalization**:
   ```javascript
   const cache = new InMemoryCache({
     typePolicies: {
       User: {
         keyFields: ['idUser']
       },
       // ... other types
     }
   })
   ```

4. **Implement Proper Cache Policies**:
   - Use `cache-first` for static data
   - Use `cache-and-network` for frequently changing data
   - Use `network-only` only when necessary

### Long-term Refactoring

1. **Consider State Management Library**:
   - **Zustand**: Lightweight, simple API
   - **Redux Toolkit**: More features, better DevTools
   - **Jotai**: Atomic state management

2. **Implement Proper State Architecture**:
   - Server state: Apollo Client
   - Client state: Context or state library
   - Persisted state: AsyncStorage with encryption

3. **Add Type Safety**:
   - Migrate to TypeScript
   - Or add PropTypes to all contexts

4. **Add State DevTools**:
   - Redux DevTools integration
   - Apollo Client DevTools
   - Custom state inspector

---

## Dependencies

### What State Management Depends On

- **React Context API**: Built into React
- **Apollo Client**: External dependency
- **AsyncStorage**: External dependency
- **React Native Paper**: For theme integration

### What Depends on State Management

- **All Screens**: Access DataContext
- **All Components**: May access contexts
- **Apollo Hooks**: Use Apollo cache
- **Navigation**: Uses theme from ThemeContext

---

## Summary

The app's state management has several critical issues:

1. **DataContext**: Object spread anti-pattern, password storage, no normalization
2. **UserContext**: Completely unused, should be removed
3. **ThemeContext**: Typo, unreliable theme detection
4. **Apollo Cache**: No persistence, inconsistent policies
5. **AsyncStorage**: No encryption, no expiration

**Priority Fixes**:
1. Fix DataContext update pattern (use functional updates)
2. Remove password from context
3. Remove unused UserContext
4. Memoize context values
5. Implement Apollo cache persistence

**Performance Impact**: Current implementation causes excessive re-renders and unnecessary network requests.

