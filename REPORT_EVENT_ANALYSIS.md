# Report Event Analysis

## Overview

The report event feature is the core functionality of the app, allowing users to report safety incidents. It includes manual event reporting, voice-based reporting with AI, urgent event handling, offline ticket saving, and complex form management with image/video uploads. This is one of the most complex features with many components and potential issues.

---

## Architecture

### Components Structure

```
ReportScreen (index.jsx)
├── Card - Manual event report button
├── CardAI - AI-assisted report button
├── CardSearch - Event search
└── AIFunctions - AI features (hidden)

NewReport ([index].jsx)
├── AlertSwitch - Urgency toggle
├── ReportEvent - Standard event form
└── ReportUrgentEvent - Urgent event form

ReportEvent Components:
├── ActionConditionButton - Event type selector
├── EventClassification - Classification dropdown
├── CompanySectorDropdown - Sector selector
├── DateTimeDialog - Date/time picker
├── EventSubtype - Subtype selector
├── EventDescription - Description input
├── RiskQualification - Risk level selector
├── SolutionState - Solution status
├── ImageVideo - Media upload
└── CameraComponent - Camera integration

Voice Reporting:
├── newvoice/[index].jsx - Voice input screen
├── upload/[upload].jsx - Voice summary upload
└── ReportEventIA - AI-processed event form
```

### Data Flow

```
User selects report type
  ↓
Form components collect data
  ↓
User submits
  ↓
Save files locally (offline support)
  ↓
Save ticket data to AsyncStorage
  ↓
WatchNewTickets detects pending tickets
  ↓
Upload when online
  ↓
Navigate back to report screen
```

---

## Report Screen Component

### Implementation (`app/(drawer)/report/index.jsx`)

**Purpose**: Main screen with cards for different report actions.

### Issues

#### Issue #1: useAsyncStorage Dependency

**Location**: Line 19

```javascript
const { value: generalData = undefined, loading, error } = useAsyncStorage('CTRLA_GENERAL_DATA')
```

**Problem**: Depends on `useAsyncStorage` which loads from AsyncStorage.

**Issues**:
- Data may be stale
- No refresh mechanism
- Loading state management

#### Issue #2: Error Handling

**Location**: Lines 28-41

**Problem**: Error handling is good, but error messages are generic.

**Impact**: User doesn't know how to fix issue.

#### Issue #3: Hidden AI Functions

**Location**: Line 73

```javascript
<View style={{ display: 'none' }}>
  <AIFunctions />
</View>
```

**Problem**: Component is rendered but hidden.

**Impact**: 
- Unnecessary render
- Component may still execute logic

**Fix**: Use conditional rendering:
```javascript
{false && <AIFunctions />}  // Or remove entirely
```

---

## NewReport Component

### Implementation (`app/(drawer)/report/new/[index].jsx`)

**Purpose**: Container for event form with urgency toggle.

### Issues

#### Issue #1: JSON.parse in useEffect

**Location**: Line 52

```javascript
useEffect(() => {
  defaultValues = JSON.parse(defaultValues)
  setEventNumber(ticketsAcount)
}, [])
```

**Problem**: 
- `defaultValues` is a `let` variable, not state
- Parsing happens in effect but value may be used before
- No error handling for invalid JSON

**Impact**: Potential crashes if JSON is invalid.

**Fix**: Parse in state initialization or add error handling.

#### Issue #2: Duplicate useEffect

**Location**: Lines 51-54, 56

```javascript
useEffect(() => {
  defaultValues = JSON.parse(defaultValues)
  setEventNumber(ticketsAcount)
}, [])

useEffect(() => setEventNumber(ticketsAcount), [ticketsAcount])
```

**Problem**: Two effects setting same state.

**Fix**: Combine into one effect.

---

## ReportEvent Component

### Implementation (`app/(drawer)/report/Components/newEvents/ReportEvent.jsx`)

**Purpose**: Main event reporting form.

### Critical Issues

#### Issue #1: Offline Ticket Saving

**Location**: Lines 25, 53-62, 117-122

**Problem**: Offline saving mechanism has issues:

```javascript
const PENDING_UPLOADS_KEY = 'PendingTickets-' + Date.now().toString()
```

**Issues**:
- Key includes timestamp, creating new key on every render
- No way to retrieve pending tickets (key is lost)
- Files saved locally but may not be cleaned up

**Impact**: 
- Pending tickets may be lost
- Storage may fill up with orphaned files

**Fix**: Use consistent key:
```javascript
const PENDING_UPLOADS_KEY = 'PendingTickets'
```

#### Issue #2: File Saving Logic

**Location**: Lines 28-50, 119-122

**Problem**: Files saved sequentially:

```javascript
if (image1) mediaPaths.push(await saveFileLocally(image1))
if (image2) mediaPaths.push(await saveFileLocally(image2))
if (image3) mediaPaths.push(await saveFileLocally(image3))
if (video) mediaPaths.push(await saveFileLocally(video))
```

**Issues**:
- Sequential awaits (slower)
- No error handling per file
- Files saved even if ticket save fails

**Fix**: Parallelize and add error handling:
```javascript
const mediaPromises = []
if (image1) mediaPromises.push(saveFileLocally(image1))
if (image2) mediaPromises.push(saveFileLocally(image2))
if (image3) mediaPromises.push(saveFileLocally(image3))
if (video) mediaPromises.push(saveFileLocally(video))

const mediaPaths = (await Promise.all(mediaPromises)).filter(Boolean)
```

#### Issue #3: String Slicing for Classification

**Location**: Lines 131-132

```javascript
classification: eventClassification.slice(0, 1),
classificationDescription: eventClassification.slice(4),
```

**Problem**: Assumes specific string format.

**Issues**:
- Fragile if format changes
- No validation
- May cause errors if string is shorter than expected

**Impact**: Potential crashes or incorrect data.

#### Issue #4: No Network Check

**Problem**: Doesn't check network before attempting upload.

**Impact**: May fail silently or show confusing errors.

**Fix**: Check network status before upload.

#### Issue #5: Complex State Management

**Problem**: 15+ useState hooks for form fields.

**Impact**: 
- Difficult to manage
- Potential for bugs
- No form validation library

**Better Approach**: Use Formik or react-hook-form.

---

## ReportUrgentEvent Component

### Implementation (`app/(drawer)/report/Components/newEvents/ReportUrgentEvent.jsx`)

**Purpose**: Urgent event reporting with pre-filled values.

### Issues

#### Issue #1: Hardcoded Default Values

**Location**: Lines 164-167

```javascript
SetSolutionState('Pending action')
setRiskQualification('Extremely Dangerous')
```

**Problem**: Hardcoded strings.

**Issues**:
- Not internationalized
- May not match backend values
- Difficult to change

#### Issue #2: Different Classification Slicing

**Location**: Line 130

```javascript
classification: eventClassification.slice(0, 3),  // Different from ReportEvent!
classificationDescription: eventClassification.slice(6),
```

**Problem**: Different slicing logic than `ReportEvent`.

**Impact**: Inconsistent data format.

---

## Voice Reporting

### Implementation (`app/(drawer)/report/newvoice/`)

**Purpose**: Voice-to-text event reporting with AI processing.

### Components

1. **newvoice/[index].jsx**: Voice input screen
2. **upload/[upload].jsx**: Voice summary upload
3. **ReportEventIA**: AI-processed event form

### Issues

**Needs Analysis**: Voice reporting components not fully reviewed, but likely have:
- Voice recognition integration issues
- AI processing errors
- Complex state management

---

## Form Components

### Event Classification

**Location**: `EventClassification.jsx`

**Purpose**: Dropdown for event classification.

### Event Subtype

**Location**: `EventSubtype.jsx`

**Purpose**: Dropdown for event subtype.

### Risk Qualification

**Location**: `RiskQualification.jsx`, `UrgentRiskQualification.jsx`

**Purpose**: Risk level selector.

### Issues

**Needs Analysis**: Form components not fully reviewed, but likely have:
- Dropdown state management
- Data dependency issues
- No proper error handling

---

## Image/Video Handling

### ImageVideo Component

**Location**: `ImageVideo.jsx`

**Purpose**: Handles image/video selection and preview.

### CameraComponent

**Location**: `CameraComponent.jsx`

**Purpose**: Camera integration for taking photos/videos.

### Issues

**Needs Analysis**: Media components not fully reviewed, but likely have:
- Image compression issues
- Video size/format issues
- Memory leaks with large files
- No proper cleanup

---

## Offline Support

### Implementation

**Location**: `ReportEvent.jsx`, `watchNewTickets.jsx`

**Purpose**: Save tickets offline and upload when online.

### Issues

#### Issue #1: Key Management

**Problem**: `PENDING_UPLOADS_KEY` includes timestamp, creating new keys.

**Impact**: Can't retrieve pending tickets.

#### Issue #2: No Cleanup

**Problem**: Local files not cleaned up after upload.

**Impact**: Storage fills up over time.

#### Issue #3: No Retry Logic

**Problem**: If upload fails, ticket stays pending forever.

**Impact**: Lost tickets.

#### Issue #4: No Conflict Resolution

**Problem**: No handling for duplicate uploads.

**Impact**: Potential duplicate tickets.

---

## AI Integration

### ReportEventIA Component

**Location**: `ReportEventIA.jsx`

**Purpose**: AI-processed event form from voice input.

### Issues

**Needs Analysis**: AI components not fully reviewed, but likely have:
- AI processing errors
- JSON parsing issues
- Complex state management

---

## Critical Issues Summary

1. **Offline Key Management**: Key includes timestamp, can't retrieve tickets
2. **File Saving**: Sequential, no error handling
3. **String Slicing**: Fragile classification parsing
4. **Complex State**: 15+ useState hooks, no form library
5. **No Network Check**: Doesn't check before upload
6. **No Cleanup**: Files not cleaned up after upload
7. **No Retry Logic**: Failed uploads stay pending

---

## Recommendations

### Critical Fixes

1. **Fix Offline Key**:
   ```javascript
   const PENDING_UPLOADS_KEY = 'PendingTickets'  // Consistent key
   ```

2. **Parallelize File Saving**:
   ```javascript
   const mediaPaths = await Promise.all(mediaPromises)
   ```

3. **Add Network Check**:
   ```javascript
   const isOnline = await NetInfo.fetch().then(state => state.isConnected)
   if (!isOnline) {
     // Save offline
   }
   ```

4. **Add Cleanup**:
   ```javascript
   // After successful upload
   await FileSystem.deleteAsync(localFilePath, { idempotent: true })
   ```

5. **Add Retry Logic**:
   ```javascript
   // Retry failed uploads
   const retryPendingTickets = async () => {
     // Implementation
   }
   ```

### Medium-term Improvements

1. **Use Form Library**: Formik or react-hook-form
2. **Add Validation**: Real-time form validation
3. **Improve Error Handling**: Specific error messages
4. **Add Progress Indicators**: Upload progress
5. **Optimize Image Compression**: Reduce file sizes

### Long-term Enhancements

1. **Add Draft Saving**: Save incomplete forms
2. **Add Templates**: Pre-filled forms for common events
3. **Add Attachments**: Support documents
4. **Add Geolocation**: Automatic location tagging
5. **Add Offline Sync**: Better offline/online sync

---

## Dependencies

### What Report Depends On

- `useAsyncStorage` for general data
- Form components (15+)
- Camera/image picker
- File system for offline storage
- Network detection
- AI processing (for voice)

### What Depends on Report

- WatchNewTickets for pending uploads
- Event search
- Event display

---

## Summary

The report event feature is complex and functional but has several issues:

1. **Offline Support**: Key management broken, no cleanup
2. **File Handling**: Sequential, no error handling
3. **State Management**: Too many useState hooks
4. **String Parsing**: Fragile classification parsing
5. **No Network Check**: Doesn't check before upload
6. **No Retry Logic**: Failed uploads stay pending

**Priority Fixes**:
1. Fix offline key management
2. Parallelize file saving
3. Add network check
4. Add cleanup logic
5. Add retry mechanism

**Complexity**: This is the most complex feature with many moving parts. Needs careful refactoring.

