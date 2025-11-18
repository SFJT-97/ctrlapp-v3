# Hooks & Data Fetching Analysis

## Overview

The app uses custom React hooks to encapsulate GraphQL queries and mutations. There are 26 hook files in `context/hooks/` with 82+ uses of Apollo Client hooks (`useQuery`, `useLazyQuery`, `useMutation`). While this pattern provides a clean abstraction, there are significant inconsistencies in return types, error handling, and caching strategies.

---

## Hook Architecture Pattern

### Standard Hook Structure

Most hooks follow this pattern:

```javascript
const queryQ = gql`
  query QueryName($param: Type!) {
    queryName(param: $param) {
      field1
      field2
    }
  }
`

export const useHookName = (param) => {
  const { loading, error, data } = useQuery(queryQ, { 
    variables: { param },
    fetchPolicy: 'network-only' 
  })
  
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  
  return data?.queryName || {}
}
```

### Issues with This Pattern

1. **Inconsistent Return Types**: Some return strings, some return objects, some return arrays
2. **No Type Safety**: No TypeScript or PropTypes
3. **Error as String**: Errors returned as template strings, not error objects
4. **Loading as String**: Loading state returned as string, not boolean
5. **No Proper Error Handling**: Errors not properly typed or handled

---

## Hook Categories

### 1. User Hooks (`userQH.js`)

#### `useMe()` - CRITICAL ISSUE

**Location**: `context/hooks/userQH.js:160-174`

**Current Implementation**:
```javascript
export const useMe = () => {
  const { loading, error, data } = useQuery(meQ, { fetchPolicy: 'cache-and-network' })
  if (loading) {
    return 'Loading...'
  }
  if (error) {
    return `Error! ${error}`
  }
  const meData = data
  if (meData) {
    return meData  // Returns { me: {...} }
  } else {
    return {}
  }
}
```

**Critical Issue**: Returns `data` (which is `{ me: {...} }`) instead of `data.me`

**Expected Usage**:
```javascript
const { me } = useMe()  // me is undefined!
```

**Actual Data Structure**:
```javascript
// useMe returns: { me: { idUser: '...', ... } }
// But code expects: { idUser: '...', ... }
```

**Impact**: Profile page and other components can't access user data correctly.

**Fix**:
```javascript
export const useMe = () => {
  const { loading, error, data } = useQuery(meQ, { fetchPolicy: 'cache-and-network' })
  
  if (loading) {
    return { loading: true, me: null, error: null }
  }
  
  if (error) {
    return { loading: false, me: null, error }
  }
  
  return { 
    loading: false, 
    me: data?.me || null,
    error: null 
  }
}
```

#### `useAllUsers()`

**Issues**:
- Returns `'loading...'` (lowercase) instead of consistent `'Loading...'`
- Returns error as string template
- No proper error object

#### `useAllUsersFromCompany()`

**Issues**:
- Inconsistent parameter handling (`isCompanyAppAdmin = null` vs `undefined`)
- Returns `{}` on error, which is falsy and hard to distinguish from empty data
- Uses `console.error` but still returns error string

#### `useAllUsersFromMyCompany()`

**Issues**:
- Returns entire `data` object instead of `data.allUsersFromMyCompany`
- Same return type inconsistency as `useMe`

**Code**:
```javascript
const allUsersFromMyCompany = data  // Should be data.allUsersFromMyCompany
return allUsersFromMyCompany
```

---

### 2. Chat Hooks (`chatQH.js`)

#### `useChatBy2Users()`

**Issues**:
- Incorrect `useQuery` options syntax (options passed as third argument instead of second)
- No proper error handling

**Current**:
```javascript
useQuery(chatBy2UsersQ, { variables: { idUser, idUserTo } }, { fetchPolicy: 'network-only' })
```

**Correct**:
```javascript
useQuery(chatBy2UsersQ, { 
  variables: { idUser, idUserTo },
  fetchPolicy: 'network-only' 
})
```

#### `useChatByIdConversation()`

**Issues**:
- Same options syntax issue
- No polling support (but used with polling in components)

#### `useLastMsgBy2Users()`

**Issues**:
- Same options syntax issue
- Returns single message, but naming suggests multiple

---

### 3. Ticket Hooks (`ticketQH.js`, `ticketNewQH.js`)

#### `useAllMyCommpanyTicketsCount()` - Typo

**Issue**: Function name has typo (`Commpany` instead of `Company`)

#### `useAsyncStorage()` - Custom Hook

**Location**: `context/hooks/ticketNewQH.js:54-109`

**Implementation**:
```javascript
export function useAsyncStorage(key, defaultValue = {}) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    // ... async loading logic
    return () => { isMounted = false }
  }, [key])

  return { value, loading, error }
}
```

**Good Practices**:
- ✅ Proper cleanup with `isMounted` flag
- ✅ Error handling
- ✅ Loading state
- ✅ Type validation

**Issues**:
- No way to update/refresh value
- No way to clear value
- No expiration mechanism

**Usage**: Used extensively for `'CTRLA_GENERAL_DATA'` caching

---

### 4. Company Data Hooks (`companyDataQH.js`)

#### `useAllCompanies()`

**Issues**:
- Unnecessary `.map(el => el)` operation
- Returns wrapped object `{ allCompaniesData }` instead of array directly

**Code**:
```javascript
const allCompaniesData = data.allCompanies.map(el => el)
return { allCompaniesData }  // Why wrap in object?
```

#### `useMyCompanyData()`

**Issues**:
- Returns entire `data` object instead of `data.myCompanyData`
- Same issue as `useMe`

---

### 5. Sector Hooks (`companySectorQ.js`)

#### `useMyCompanySectors()`

**Issues**:
- No loading/error handling (commented out)
- Returns entire `data` object instead of `data.myCompanySectors`
- Uses `cache-and-network` (good) but inconsistent with other hooks

**Code**:
```javascript
export const useMyCompanySectors = () => {
  const { data } = useQuery(myCompanySectorsQH, { fetchPolicy: 'cache-and-network' })
  // Loading/error handling commented out!
  
  const myCompanySectors = data  // Should be data.myCompanySectors
  return myCompanySectors || {}
}
```

---

### 6. Configuration Hooks (`userConfiguration.js`)

#### `useMyConfig()` - CRITICAL ISSUE

**Location**: `context/hooks/userConfiguration.js:52-61`

**Current Implementation**:
```javascript
export const useMyConfig = () => {
  const { loading, error, data } = useQuery(myConfigQ, { fetchPolicy: 'network-only' })
  if (data === undefined) return 'ApolloError'
  if (loading) return 'Loading...'
  if (error) return `Error! ${error}`
  const myConfigData = data.myConfig
  return myConfigData
}
```

**Issues**:
- Returns string `'ApolloError'` when `data === undefined` (before query runs)
- Returns string `'Loading...'` instead of proper loading state
- Returns string error instead of error object
- Inconsistent with other hooks

**Fix**:
```javascript
export const useMyConfig = () => {
  const { loading, error, data } = useQuery(myConfigQ, { fetchPolicy: 'network-only' })
  
  if (loading) {
    return { loading: true, config: null, error: null }
  }
  
  if (error) {
    return { loading: false, config: null, error }
  }
  
  return { 
    loading: false, 
    config: data?.myConfig || null, 
    error: null 
  }
}
```

#### `useGetIdConfigByIdEmployee()`

**Issues**:
- Returns `'ApolloError'` string when `data === undefined`
- Returns only `idUserConfiguration` instead of full config object

---

### 7. Notification Hooks (`notificationQH.js`)

#### `useNotificationByIdUser()`

**Issues**:
- Unnecessary `.map(el => el)` operation
- Returns wrapped object instead of array

#### `useNotificationsToLevel()`

**Issues**:
- Same unnecessary mapping
- Same wrapping issue

---

### 8. Signed URL Hook (`useGetSignedUrlFromCache.js`)

**Location**: `context/hooks/useGetSignedUrlFromCache.js`

**Critical Issues**:

1. **Uses Mutation for Query**: Uses `useMutation` for what should be a query
2. **Async in Render**: Calls async functions in render
3. **No Proper Return**: Returns Promise array, not resolved data
4. **No Error Handling**: Errors logged but not handled

**Current Implementation**:
```javascript
export const useGetSignedUrlFromCache = (items) => {
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  
  const reelsData = items.map(async el => {
    // Async operations in map - returns Promise array!
    let tempData
    // ... multiple await calls
    return tempData
  })
  
  if (reelsData) return reelsData  // Returns Promise[], not data!
}
```

**Problems**:
- `reelsData` is an array of Promises, not resolved data
- Component using this hook gets Promises, not URLs
- No way to know when all URLs are fetched
- No error handling

**Fix**: Should use `useEffect` with state:
```javascript
export const useGetSignedUrlFromCache = (items) => {
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const results = await Promise.all(
          items.map(async (el) => {
            // Fetch URLs for each item
          })
        )
        setUrls(results)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    
    if (items?.length) fetchUrls()
  }, [items])

  return { urls, loading, error }
}
```

---

## Common Patterns & Issues

### Pattern 1: Incorrect useQuery Options

**Problem**: Options passed as third argument instead of second

**Example**:
```javascript
// WRONG
useQuery(query, { variables: { ... } }, { fetchPolicy: 'network-only' })

// CORRECT
useQuery(query, { 
  variables: { ... },
  fetchPolicy: 'network-only' 
})
```

**Affected Hooks**:
- `useChatBy2Users`
- `useChatByIdConversation`
- `useLastMsgBy2Users`
- `useFindCompany`
- `useAllCompanySectors`
- `useNotificationByIdUser`
- `useNotificationsToLevel`
- And many more...

**Impact**: Options may not be applied correctly, causing unexpected behavior.

### Pattern 2: Inconsistent Return Types

**Problem**: Hooks return different types for same states

**Examples**:
- Loading: `'Loading...'`, `'loading...'`, `{ loading: true }`
- Error: `'Error! ${error}'`, `'ApolloError'`, `{ error }`
- Data: `data`, `data.field`, `{ field: data.field }`, `{}`

**Impact**: Components must handle multiple return types, leading to bugs.

### Pattern 3: Returning Wrong Data Structure

**Problem**: Hooks return `data` object instead of `data.queryName`

**Examples**:
- `useMe()` returns `data` instead of `data.me`
- `useAllUsersFromMyCompany()` returns `data` instead of `data.allUsersFromMyCompany`
- `useMyCompanyData()` returns `data` instead of `data.myCompanyData`
- `useMyCompanySectors()` returns `data` instead of `data.myCompanySectors`

**Impact**: Components can't access data correctly.

### Pattern 4: Unnecessary Array Mapping

**Problem**: Mapping arrays to themselves

**Examples**:
```javascript
// Unnecessary
const allCompaniesData = data.allCompanies.map(el => el)

// Should be
const allCompaniesData = data.allCompanies
```

**Affected**: `useAllCompanies`, `useNotificationByIdUser`, `useNotificationsToLevel`

### Pattern 5: Wrapping Returns in Objects

**Problem**: Wrapping single values in objects unnecessarily

**Examples**:
```javascript
// Unnecessary wrapping
return { allCompaniesData }

// Should be
return allCompaniesData
```

### Pattern 6: No Error Boundaries

**Problem**: Errors returned as strings, not handled properly

**Impact**: Components can't distinguish between loading, error, and data states.

---

## Fetch Policy Analysis

### Current Policies

1. **`'network-only'`**: Used in 80%+ of hooks
   - Bypasses cache completely
   - Always fetches from network
   - Good for: Real-time data, frequently changing data
   - Bad for: Static data, dropdown options

2. **`'cache-and-network'`**: Used in ~10% of hooks
   - Returns cached data immediately, then fetches fresh
   - Good for: User data, company data
   - Used in: `useMe`, `useMyCompanyData`, `useMyCompanySectors`

3. **`'cache-first'`**: Not used
   - Would be good for: Static dropdowns, classifications

### Issues

1. **Overuse of `'network-only'`**: 
   - Dropdown options (classifications, sectors) don't change often
   - Should use `'cache-first'` or `'cache-and-network'`

2. **No Cache Invalidation**:
   - Mutations don't update cache
   - Cache not invalidated on logout/login

3. **No Cache Persistence**:
   - Cache lost on app restart
   - Requires full refetch

---

## Polling vs Subscriptions

### Current: Polling Only

**No GraphQL Subscriptions Used**

**Polling Examples**:
- Chat: `pollInterval: 5000` (5 seconds)
- Home dashboard: Custom polling via `WatchNewTickets`

**Issues**:
- Battery drain
- Unnecessary network requests
- No optimization for background state

**Recommendation**: Implement GraphQL subscriptions for real-time features.

---

## Hook Usage Patterns in Components

### Pattern 1: Direct Usage

```javascript
const { me } = useMe()
if (me === 'Loading...') {
  // Handle loading
}
```

**Problem**: String comparison for loading state.

### Pattern 2: String Checks

```javascript
if (me !== 'Loading...' && me !== 'ApolloError') {
  // Use me
}
```

**Problem**: Fragile, depends on exact string values.

### Pattern 3: Conditional Rendering

```javascript
{me && me !== 'Loading...' && (
  <Component data={me} />
)}
```

**Problem**: Doesn't handle errors properly.

---

## Recommendations

### Short-term Fixes

1. **Fix `useMe` Hook**:
   ```javascript
   return { loading: false, me: data?.me || null, error: null }
   ```

2. **Fix `useMyConfig` Hook**:
   ```javascript
   return { loading: false, config: data?.myConfig || null, error: null }
   ```

3. **Fix useQuery Options Syntax**:
   - Move all options to second argument
   - Remove third argument pattern

4. **Standardize Return Types**:
   ```javascript
   // Standard return type
   return {
     loading: boolean,
     data: T | null,
     error: Error | null
   }
   ```

5. **Fix Data Structure Returns**:
   - Return `data.queryName` not `data`
   - Remove unnecessary wrapping

### Medium-term Improvements

1. **Create Hook Factory**:
   ```javascript
   function createQueryHook(query, options = {}) {
     return (variables) => {
       const { loading, error, data } = useQuery(query, {
         variables,
         ...options
       })
       
       return {
         loading,
         error,
         data: data?.[Object.keys(data)[0]] || null
       }
     }
   }
   ```

2. **Implement Proper Error Handling**:
   - Return error objects, not strings
   - Provide error boundaries
   - Add retry logic

3. **Optimize Fetch Policies**:
   - Use `cache-first` for static data
   - Use `cache-and-network` for user data
   - Use `network-only` only when necessary

4. **Add Cache Invalidation**:
   - Update cache on mutations
   - Invalidate on login/logout
   - Add cache expiration

### Long-term Refactoring

1. **Migrate to TypeScript**:
   - Type all hooks
   - Type return values
   - Type parameters

2. **Implement React Query**:
   - Better caching
   - Better error handling
   - Better loading states
   - Automatic refetching

3. **Add GraphQL Subscriptions**:
   - Real-time chat
   - Real-time notifications
   - Real-time event updates

4. **Create Hook Testing**:
   - Unit tests for hooks
   - Integration tests
   - Mock Apollo Client

---

## Hook Inventory

### User Hooks
- `useMe` - Current user (CRITICAL ISSUE)
- `useAllUsers` - All users
- `useAllUsersFromCompany` - Users by company
- `useAllUsersFromMyCompany` - Users from my company
- `useTotalUsersFromCompany` - User count

### Chat Hooks
- `useChatBy2Users` - Chat between two users
- `useChatByIdConversation` - Chat by conversation ID
- `useLastMsgBy2Users` - Last message between users
- `useTotalUnReadChatsByIdUser` - Unread count

### Ticket Hooks
- `useAllMyCommpanyTicketsCount` - Ticket count (typo in name)
- `useAsyncStorage` - AsyncStorage wrapper

### Company Hooks
- `useAllCompanies` - All companies
- `useFindCompany` - Find company by name
- `useMyCompanyData` - My company data
- `useAllCompanySectors` - Company sectors
- `useMyCompanySectors` - My company sectors

### Configuration Hooks
- `useMyConfig` - User configuration (CRITICAL ISSUE)
- `useGetIdConfigByIdEmployee` - Config ID by employee

### Notification Hooks
- `useNotificationByIdUser` - Notifications by user
- `useNotificationsToLevel` - Notifications by level

### Other Hooks
- `useGetSignedUrlFromCache` - AWS signed URLs (CRITICAL ISSUE)
- Various classification, sector, role hooks

---

## Summary

The hooks system has several critical issues:

1. **`useMe` returns wrong structure** - Breaks profile page
2. **`useMyConfig` returns inconsistent types** - Breaks profile page
3. **`useGetSignedUrlFromCache` returns Promises** - Breaks image loading
4. **Incorrect useQuery options syntax** - May cause unexpected behavior
5. **Inconsistent return types** - Makes components fragile
6. **Overuse of `network-only`** - Unnecessary network requests
7. **No error handling** - Errors returned as strings
8. **No type safety** - Runtime errors from type mismatches

**Priority Fixes**:
1. Fix `useMe` return structure
2. Fix `useMyConfig` return structure
3. Fix `useGetSignedUrlFromCache` async handling
4. Standardize all hook return types
5. Fix useQuery options syntax

**Performance Impact**: Current implementation causes excessive network requests and makes components fragile.

