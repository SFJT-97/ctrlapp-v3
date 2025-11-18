# Home Dashboard Analysis

## Overview

The home dashboard is the main screen users see after logging in. It displays safety statistics via donut charts, a position/sector selector, real-time event feed, and notification banners. The dashboard uses polling for real-time updates and integrates multiple data sources.

---

## Architecture

### Components Structure

```
HomePage (index.jsx)
├── DonutCharts - Safety statistics visualization
├── Position - Sector/position selector
├── WatchNewTickets - Real-time ticket watcher
├── WatchNewValues - Data refresh mechanism
├── HomeBottomSheetModal - Event detail modal
└── BottomSheetBU - Business unit selector
```

### Data Flow

```
Component Mounts
  ↓
Fetch user data (useMe)
Fetch company sectors (useMyCompanySectors)
  ↓
Wait for both to load (count > 1)
  ↓
Display Position component
  ↓
WatchNewTickets polls every 30s
WatchNewValues refreshes data periodically
  ↓
User interacts with charts/events
  ↓
Open bottom sheet modals for details
```

---

## HomePage Component

### Implementation (`app/(drawer)/home/index.jsx`)

### Critical Issues

#### Issue #1: useMe Hook Returns Wrong Structure

**Location**: Line 42

```javascript
const { me } = useMe()
```

**Problem**: `useMe()` returns `{ me: {...} }` but code expects `me` directly.

**Impact**: `me` is undefined, causing issues throughout component.

**Fix**: Update to handle correct structure or fix `useMe` hook.

#### Issue #2: useMyCompanySectors Returns Wrong Structure

**Location**: Line 43

```javascript
const { myCompanySectors } = useMyCompanySectors()
```

**Problem**: `useMyCompanySectors()` returns entire `data` object, not `data.myCompanySectors`.

**Impact**: `myCompanySectors` may be undefined or wrong structure.

#### Issue #3: Count Pattern Anti-Pattern

**Location**: Lines 52, 69-85

```javascript
const [count, setCount] = useState(0)

useEffect(() => {
  if (myCompanySectors && ...) {
    setCount(prevCount => prevCount + 1)
  }
}, [myCompanySectors])

useEffect(() => {
  if (me && ...) {
    setCount(prevCount => prevCount + 1)
  }
}, [me])

useEffect(() => {
  if (count > 1) setLoaded(true)
}, [count])
```

**Problem**: Uses counter to track when dependencies are ready.

**Issues**:
- Magic number (`count > 1`)
- Unpredictable behavior
- Race conditions possible

**Better Approach**:
```javascript
const isDataReady = useMemo(() => {
  return (
    me && me !== 'Loading...' && me !== 'ApolloError' &&
    myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError'
  )
}, [me, myCompanySectors])
```

#### Issue #4: Object Spread in State Updates

**Location**: Lines 71, 78

```javascript
setPositionValues({ ...positionValues, myCompanySectors })
setPositionValues({ ...positionValues, me })
```

**Problem**: Spreads entire object to update one field.

**Impact**: Potential stale closures, unnecessary re-renders.

**Fix**: Use functional updates:
```javascript
setPositionValues(prev => ({ ...prev, myCompanySectors }))
```

#### Issue #5: String Comparisons for Loading/Error

**Location**: Lines 70, 77

```javascript
if (myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError')
```

**Problem**: Fragile string comparisons.

**Impact**: Breaks if hook return format changes.

#### Issue #6: Device Registration on Every Render

**Location**: Lines 87-107

```javascript
useEffect(() => {
  if (!data) return
  async function addNewDevice(tokenDevice) {
    await addNewDeviceToUser({ variables: { tokenDevice, platform } })
  }
  addNewDevice(data.idDevice)
}, [data])
```

**Problem**: Registers device every time `data` changes.

**Impact**: 
- Multiple device registrations
- Unnecessary API calls
- Potential duplicate device entries

**Fix**: Only register once on mount:
```javascript
useEffect(() => {
  if (!data?.idDevice) return
  const registerDevice = async () => {
    // Register device
  }
  registerDevice()
}, []) // Only on mount
```

#### Issue #7: Notification Permission Request

**Location**: Lines 109-143

**Problem**: Requests notification permission on every mount.

**Impact**: 
- May show permission dialog repeatedly
- Poor UX

**Fix**: Check permission status first, only request if needed.

---

## WatchNewTickets Component

### Implementation (`globals/watchNewTickets.jsx`)

**Purpose**: Watches for new tickets and displays notifications.

### Issues

#### Issue #1: Polling Interval

**Location**: Line 82

```javascript
const WATCHTICKET_TIME = 1000 * 30 // 30 seconds
```

**Problem**: Polls every 30 seconds regardless of app state.

**Impact**: 
- Battery drain
- Unnecessary network requests
- Continues in background

**Fix**: Only poll when app is in foreground and screen is focused.

#### Issue #2: No Cleanup

**Problem**: Polling continues even when component unmounts or screen is not visible.

**Impact**: Memory leaks, unnecessary operations.

---

## WatchNewValues Component

### Implementation (`globals/WatchNewValues.jsx`)

**Purpose**: Refreshes general data (user, company, dropdowns) and stores in AsyncStorage.

### Issues

#### Issue #1: Polling Every 2 Minutes

**Problem**: Polls 8 different queries every 2 minutes.

**Impact**: 
- High network usage
- Battery drain
- Server load

#### Issue #2: Stores Large Data in AsyncStorage

**Problem**: Stores all general data in `'CTRLA_GENERAL_DATA'` key.

**Impact**: 
- Large storage usage
- No expiration
- Potential for stale data

---

## DonutCharts Component

### Location: `app/(drawer)/home/components/charts/donutCharts.jsx`

**Purpose**: Displays safety statistics in donut chart format.

### Issues

#### Issue #1: Performance

**Problem**: Charts may re-render unnecessarily.

**Impact**: Laggy animations, poor performance.

**Fix**: Memoize chart data, use React.memo.

---

## Position Component

### Location: `app/(drawer)/home/components/position.jsx`

**Purpose**: Allows user to select sector/position for filtering events.

### Issues

**Needs Analysis**: Component not fully reviewed, but likely has similar state management issues.

---

## Event Display Components

### Location: `app/(drawer)/home/components/event/`

**Components**:
- `EventCarousel.jsx` - Event carousel
- `content.jsx` - Event content
- `chips.jsx` - Event tags
- `reactions.jsx` - Like/comment reactions
- `ShowComments.jsx` - Comments display
- `TicketImgesPreview.jsx` - Image preview
- `ZoomableImage.jsx` - Zoomable images

### Issues

**Needs Analysis**: Components not fully reviewed, but likely have:
- Performance issues with image loading
- No virtualization for long lists
- Potential memory leaks with images

---

## Banner Component

### Location: `app/(drawer)/home/components/banner.jsx`

**Purpose**: Bottom sheet modal for urgent event notifications.

### Issues

**Needs Analysis**: Component not fully reviewed.

---

## Critical Issues Summary

1. **useMe/useMyCompanySectors Return Structure**: Hooks return wrong data structure
2. **Count Pattern**: Anti-pattern for tracking readiness
3. **Object Spread**: Potential stale closures
4. **String Comparisons**: Fragile loading/error checks
5. **Device Registration**: Registers on every data change
6. **Polling**: No optimization for background/foreground
7. **No Cleanup**: Polling continues after unmount

---

## Optimization Opportunities

1. **Memoize Chart Data**: Prevent unnecessary re-renders
2. **Virtualize Event Lists**: Use FlatList for long lists
3. **Optimize Image Loading**: Implement proper caching
4. **Smart Polling**: Only poll when screen is focused
5. **Cache Strategy**: Better caching for static data
6. **Lazy Load Components**: Load heavy components on demand

---

## Dependencies

### What Home Dashboard Depends On

- `useMe` hook (broken)
- `useMyCompanySectors` hook (broken)
- `DataContext` for device info
- `WatchNewTickets` for real-time updates
- `WatchNewValues` for data refresh
- Chart components
- Event display components

### What Depends on Home Dashboard

- Navigation from login
- Other screens may depend on data loaded here

---

## Summary

The home dashboard has several critical issues:

1. **Broken Hook Usage**: `useMe` and `useMyCompanySectors` return wrong structures
2. **Anti-Patterns**: Count pattern, object spread in state
3. **Performance**: Excessive polling, no optimization
4. **Memory Leaks**: No cleanup for polling

**Priority Fixes**:
1. Fix hook return structures
2. Replace count pattern with proper state management
3. Optimize polling (only when focused)
4. Add proper cleanup
5. Fix device registration logic

**Performance Impact**: Current implementation causes excessive network requests and potential memory leaks.

