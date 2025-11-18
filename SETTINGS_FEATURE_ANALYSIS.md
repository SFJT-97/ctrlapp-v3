# Settings Feature Analysis

## Overview

The settings feature allows users to manage company sectors, view sector maps, and configure sector-related settings. It includes a complex map component for sector visualization and selection, along with data tables and dropdowns for sector management.

---

## Architecture

### Components

```
SettingsScreen (index.jsx)
├── SectorCanvas - Main sector management
│   ├── MyReactMap - Map visualization
│   ├── CompanySectorDropdown - Sector selector
│   └── CustomDataTable - Sector data table
└── Screen orientation handling
```

### Data Flow

```
Component Mounts
  ↓
Fetch user data (useMe) - BROKEN
Fetch company sectors (useMyCompanySectors) - BROKEN
  ↓
Display map with sectors
  ↓
User selects sector
  ↓
Update sector data
```

---

## Settings Screen Component

### Implementation (`app/(drawer)/settings/index.jsx`)

### Critical Issues

#### Issue #1: useMe Hook Returns Wrong Structure

**Location**: Line 30

```javascript
const { me } = useMe()
```

**Problem**: Same issue as other components - `useMe()` returns wrong structure.

**Impact**: `me.companyName` may be undefined.

#### Issue #2: useMyCompanySectors Returns Wrong Structure

**Location**: Line 31, 43-44

```javascript
const myCompanySectors = useMyCompanySectors()

useEffect(() => {
  if (myCompanySectors && myCompanySectors !== 'Loading...' && myCompanySectors !== 'ApolloError') {
    setCompanySector(myCompanySectors?.myCompanySectors)  // Accessing nested property
  }
}, [myCompanySectors])
```

**Problem**: Code tries to access `myCompanySectors.myCompanySectors`, but hook returns entire `data` object.

**Impact**: Sector data may not load correctly.

#### Issue #3: String Comparisons

**Location**: Lines 37, 43

```javascript
if (me && me !== 'Loading...' && me !== 'Apollo Error')  // Note: 'Apollo Error' with space
```

**Problem**: 
- Fragile string comparisons
- Inconsistent error string ('Apollo Error' vs 'ApolloError')

**Impact**: May not catch errors correctly.

#### Issue #4: Orientation Handling

**Location**: Lines 48-74

**Problem**: Complex orientation handling with potential issues:

```javascript
let subscription = 1  // Initialized to number, not subscription object

const subscription = ScreenOrientation.addOrientationChangeListener(...)

return () => {
  ScreenOrientation.removeOrientationChangeListener(subscription)  // May fail if subscription is 1
}
```

**Issues**:
- `subscription` initialized to `1` (number)
- Later assigned subscription object
- Cleanup may fail if subscription is still `1`

**Fix**:
```javascript
const [subscription, setSubscription] = useState(null)

useEffect(() => {
  const sub = ScreenOrientation.addOrientationChangeListener(...)
  setSubscription(sub)
  
  return () => {
    if (subscription) {
      ScreenOrientation.removeOrientationChangeListener(subscription)
    }
  }
}, [])
```

#### Issue #5: Conditional Rendering Based on Orientation

**Location**: Line 76

```javascript
if (orientation < 2) {
  return (/* Portrait UI */)
}
// Landscape UI
```

**Problem**: Hardcoded magic number `2`.

**Issues**:
- Unclear what `2` represents
- May break if orientation enum changes

**Fix**: Use named constants:
```javascript
const ORIENTATION_PORTRAIT = 1
if (orientation < ORIENTATION_PORTRAIT + 1) {
  // Portrait
}
```

---

## MyReactMap Component

### Location: `app/(drawer)/settings/components/MyReactMap.jsx`

**Purpose**: Displays interactive map with sector overlays.

### Issues

**Needs Analysis**: Map component not fully reviewed, but likely has:
- Performance issues with many sectors
- Memory leaks with map instances
- Complex coordinate calculations

---

## CompanySectorDropdown Component

### Location: `app/(drawer)/settings/components/CompanySectorDropdown.jsx`

**Purpose**: Dropdown for selecting company sectors.

### Issues

**Needs Analysis**: Dropdown component not fully reviewed, but likely has:
- State management issues
- Data dependency problems

---

## CustomDataTable Component

### Location: `app/(drawer)/settings/components/CustomDataTable.jsx`

**Purpose**: Data table for displaying sector information.

### Issues

**Needs Analysis**: Data table not fully reviewed, but likely has:
- Performance issues with large datasets
- No virtualization
- No sorting/filtering

---

## Critical Issues Summary

1. **useMe/useMyCompanySectors**: Wrong return structures
2. **String Comparisons**: Fragile error checking
3. **Orientation Handling**: Subscription initialization bug
4. **Magic Numbers**: Hardcoded orientation values

---

## Recommendations

### Critical Fixes

1. **Fix Hook Usage**: Handle correct return structures
2. **Fix Orientation Subscription**: Proper initialization
3. **Replace Magic Numbers**: Use named constants
4. **Standardize Error Strings**: Consistent error format

### Medium-term Improvements

1. **Optimize Map Rendering**: Only render visible sectors
2. **Add Virtualization**: For data tables
3. **Improve Error Handling**: Proper error objects
4. **Add Loading States**: Visual feedback

---

## Dependencies

### What Settings Depends On

- `useMe` hook (broken)
- `useMyCompanySectors` hook (broken)
- Map library
- Screen orientation API

### What Depends on Settings

- Sector selection affects event reporting
- Map data used in other features

---

## Summary

The settings feature has issues similar to other features:

1. **Broken Hook Usage**: useMe and useMyCompanySectors return wrong structures
2. **Orientation Bug**: Subscription initialization issue
3. **String Comparisons**: Fragile error checking
4. **Magic Numbers**: Hardcoded orientation values

**Priority Fixes**:
1. Fix hook return structures
2. Fix orientation subscription
3. Replace magic numbers
4. Standardize error handling

