# Authentication Analysis

## Overview

The authentication system uses a traditional username/password login with optional biometric authentication. The flow involves Formik for form management, Yup for validation, GraphQL mutations for authentication, and AsyncStorage for token persistence. While functional, there are several security and UX concerns.

---

## Architecture

### Authentication Flow

```
User enters credentials
  ↓
Formik validation (Yup schema)
  ↓
Character filtering (client-side)
  ↓
Login mutation (GraphQL)
  ↓
Token received
  ↓
Token stored in AsyncStorage
  ↓
DataContext updated (loged: true)
  ↓
Redirect to /(drawer)/home
```

### Components

1. **LoginScreen** (`app/(auth)/login/index.jsx`) - Main login component
2. **FormikInputValue** - Custom input with character filtering
3. **LoginValidation** (`LoginValidation.js`) - Yup validation schema
4. **GetToken** (`context/GetToken.js`) - FCM token retrieval
5. **StyledTextInput** - Themed input component

---

## Login Screen Component

### Implementation (`app/(auth)/login/index.jsx`)

**Key Features**:
- Formik form management
- Yup validation
- Biometric authentication support
- FCM token registration
- Apollo GraphQL mutation

### Critical Issues

#### Issue #1: Auto-Biometric Authentication

**Location**: Lines 100-102

```javascript
useEffect(() => {
  if (isBiometricSupported) handleBiometricAuth()
}, [isBiometricSupported])
```

**Problem**: Automatically triggers biometric auth when component mounts and biometric is supported.

**UX Issues**:
- User may not want to use biometric
- No way to cancel
- Triggers immediately on mount
- May interrupt user if they're typing

**Security Issues**:
- No user consent before triggering
- No rate limiting
- May be triggered accidentally

**Fix**: Remove auto-trigger, only trigger on button press.

#### Issue #2: Password Stored in Context

**Location**: Line 161-166

```javascript
setData({
  ...values,  // Includes password!
  loged: true,
  tokenDevice,
  idDevice: tokenDevice
})
```

**Problem**: Password is stored in global DataContext after login.

**Security Risk**: Password persists in memory unnecessarily.

**Fix**:
```javascript
setData({
  nickName: values.nickName,
  loged: true,
  tokenDevice,
  idDevice: tokenDevice
  // Don't include password!
})
```

#### Issue #3: Error Handling Outside Render

**Location**: Lines 130-133

```javascript
if (loginError) {
  console.error('Login mutation error:', loginError)
  Alert.alert('Error', loginError.message || 'Login failed')
}
```

**Problem**: Error check happens during render, not in useEffect.

**Impact**: 
- Alert may show multiple times
- Error state not properly managed
- May cause render issues

**Fix**: Move to useEffect:
```javascript
useEffect(() => {
  if (loginError) {
    Alert.alert('Error', loginError.message || 'Login failed')
  }
}, [loginError])
```

#### Issue #4: Data Clearing on Every Login

**Location**: Line 147

```javascript
await clearData()  // Clears ALL AsyncStorage and Apollo cache
```

**Problem**: Clears all data including cached user data, preferences, etc.

**Impact**: 
- Loss of cached data
- Requires full refetch after login
- Slower app experience

**Better Approach**: Only clear auth-related data:
```javascript
await AsyncStorage.removeItem('token')
await client.clearStore()  // Only if needed
```

#### Issue #5: Email Handling

**Location**: Line 148

```javascript
const user = values.nickName.includes('@') ? values.nickName.split('@')[0] : values.nickName
```

**Problem**: Assumes email format is `username@domain`, extracts username.

**Issues**:
- May not work for all email formats
- No validation that it's actually an email
- Silent transformation (user may not know)

**Better Approach**: Validate email format or handle explicitly.

#### Issue #6: Missing Dependency in useEffect

**Location**: Line 87

```javascript
useEffect(() => {
  const fetchToken = async () => {
    // ...
  }
  fetchToken()
}, [])  // Missing dependencies: data, setData
```

**Problem**: Uses `data` and `setData` but not in dependencies.

**Impact**: May use stale closures.

**Fix**: Add dependencies or use functional update.

---

## FormikInputValue Component

### Implementation (Lines 39-65)

**Purpose**: Custom input field with character filtering and DataContext integration.

### Issues

#### Issue #1: Character Filtering in onChange

**Location**: Lines 48-53

```javascript
onChangeText={(value) => {
  const lastChar = String(value).charAt(String(value).length - 1)
  if (notAllowedCharacters.includes(lastChar)) {
    Alert.alert('Warning!', `Character ${lastChar} is not allowed`)
    value = String(value).replace(lastChar, '')
  }
  helpers.setValue(value)
  // ...
}}
```

**Problems**:
1. **Client-side filtering**: Should be handled by backend
2. **Alert on every invalid character**: Annoying UX
3. **String mutation**: `value = String(value).replace(...)` doesn't mutate original
4. **Updates DataContext on every keystroke**: Performance issue

**Better Approach**:
- Remove client-side filtering
- Let backend handle validation
- Or filter silently without alert

#### Issue #2: DataContext Update on Every Keystroke

**Location**: Lines 55-58

```javascript
setData({
  ...data,
  [name]: value
})
```

**Problem**: Updates global context on every keystroke.

**Impact**: 
- All context consumers re-render
- Performance degradation
- Unnecessary state updates

**Fix**: Only update context on form submit, not on every keystroke.

#### Issue #3: Duplicate Character in Array

**Location**: Line 27 (and LoginValidation.js line 3)

```javascript
const notAllowedCharacters = ['*', '%', '(', ')', '>', '/', '<', '=', '"', '\\', '>', '`', '\'']
//                                                                              ^ duplicate '>'
```

**Problem**: `'>'` appears twice in array.

**Impact**: Minor, but indicates code quality issues.

---

## Login Validation Schema

### Implementation (`LoginValidation.js`)

```javascript
export const loginValidationSchema = yup.object().shape({
  nickName: yup
    .string()
    .min(3, 'Too short!')
    .max(30, 'Too long!')
    .required('Nickname (user name) is required')
    .notOneOf(notAllowedCharacters),
  password: yup
    .string()
    .min(5, 'Too short!')
    .max(100, 'Too long!')
    .required('Password is required')
    .notOneOf(notAllowedCharacters),
  // ... other fields
})
```

### Issues

#### Issue #1: Incorrect notOneOf Usage

**Problem**: `notOneOf(notAllowedCharacters)` checks if entire value is in array, not if value contains characters.

**Expected**: Should validate that value doesn't contain any of these characters.

**Fix**: Use custom test:
```javascript
.test('no-invalid-chars', 'Contains invalid characters', (value) => {
  if (!value) return true
  return !notAllowedCharacters.some(char => value.includes(char))
})
```

#### Issue #2: Unused Fields in Schema

**Problem**: Schema defines `userName` and `name` fields that aren't in form.

**Impact**: Unnecessary validation overhead.

---

## Biometric Authentication

### Implementation (Lines 89-128)

**Features**:
- Checks for hardware support
- Checks for enrolled biometrics
- Authenticates with Face ID / Touch ID / Fingerprint
- Uses stored token if available

### Issues

#### Issue #1: Auto-Trigger on Mount

**Location**: Lines 100-102

**Problem**: Automatically triggers when component mounts.

**Fix**: Remove auto-trigger, only trigger on button press.

#### Issue #2: No Token Validation

**Location**: Line 115

```javascript
const token = await AsyncStorage.getItem('token')
if (token) {
  setData({ ...data, loged: true, ... })
}
```

**Problem**: Doesn't validate token is still valid.

**Security Risk**: Expired token may still allow access.

**Fix**: Validate token with backend before allowing access.

#### Issue #3: No Error Recovery

**Problem**: If biometric fails, user must manually enter password.

**Better UX**: Show password form if biometric fails.

---

## GetToken Function

### Implementation (`context/GetToken.js`)

**Purpose**: Retrieves FCM (Firebase Cloud Messaging) token for push notifications.

### Issues

#### Issue #1: Permission Request on Every Call

**Problem**: Requests permission every time function is called.

**Impact**: 
- May show permission dialog repeatedly
- Poor UX

**Fix**: Check permission status first, only request if not granted.

#### Issue #2: No Token Caching

**Problem**: Fetches token every time, even if already cached.

**Impact**: Unnecessary API calls.

**Fix**: Cache token and only refresh when needed.

#### Issue #3: iOS-Specific Comment

**Location**: Line 28

```javascript
// Register for remote messages (iOS-specific)
```

**Problem**: Comment suggests iOS-only, but code works on both platforms.

**Fix**: Update comment or clarify.

---

## Security Concerns

### 1. Token Storage

**Current**: Token stored in AsyncStorage (unencrypted)

**Risk**: If device is compromised, token is accessible.

**Recommendation**: Use encrypted storage (e.g., `react-native-keychain`).

### 2. Password in Memory

**Current**: Password stored in DataContext after login.

**Risk**: Password persists in memory unnecessarily.

**Recommendation**: Don't store password after authentication.

### 3. No Token Expiration

**Current**: Tokens don't expire or refresh.

**Risk**: Compromised token remains valid indefinitely.

**Recommendation**: Implement token expiration and refresh mechanism.

### 4. No Rate Limiting

**Current**: No client-side rate limiting on login attempts.

**Risk**: Brute force attacks possible.

**Recommendation**: Implement rate limiting (backend should handle this).

### 5. Character Filtering Client-Side Only

**Current**: Invalid characters filtered client-side.

**Risk**: Can be bypassed by modifying client code.

**Recommendation**: Backend should also validate and reject invalid characters.

### 6. HTTP Allowed

**Current**: Some API endpoints allow HTTP (from app.json).

**Risk**: Man-in-the-middle attacks.

**Recommendation**: Force HTTPS in production.

---

## UX Issues

### 1. Auto-Biometric Trigger

**Problem**: Biometric auth triggers automatically.

**Impact**: Interrupts user, may be unwanted.

### 2. Alert on Invalid Character

**Problem**: Alert shows on every invalid character typed.

**Impact**: Annoying, interrupts typing flow.

### 3. No Loading State on Biometric

**Problem**: No visual feedback during biometric authentication.

**Impact**: User doesn't know if auth is in progress.

### 4. Error Messages

**Problem**: Generic error messages don't help user.

**Impact**: User doesn't know how to fix issue.

### 5. No "Remember Me" Option

**Problem**: No option to stay logged in.

**Impact**: User must login every time app opens.

---

## Code Quality Issues

### 1. Dead Code

**Problem**: 200+ lines of commented-out code (lines 219-431).

**Impact**: Reduces code readability, increases maintenance burden.

**Recommendation**: Remove all commented code.

### 2. Inconsistent Error Handling

**Problem**: Some errors use Alert, some use console.error.

**Impact**: Inconsistent user experience.

### 3. Magic Strings

**Problem**: Hardcoded strings like `'Loading...'`, `'Error'`.

**Impact**: Difficult to maintain, no i18n support.

### 4. No Type Safety

**Problem**: No TypeScript or PropTypes.

**Impact**: Runtime errors from type mismatches.

---

## Recommendations

### Short-term Fixes

1. **Remove Auto-Biometric Trigger**:
   ```javascript
   // Remove this useEffect
   useEffect(() => {
     if (isBiometricSupported) handleBiometricAuth()
   }, [isBiometricSupported])
   ```

2. **Remove Password from Context**:
   ```javascript
   setData({
     nickName: values.nickName,
     loged: true,
     // Don't include password
   })
   ```

3. **Fix Error Handling**:
   ```javascript
   useEffect(() => {
     if (loginError) {
       Alert.alert('Error', loginError.message || 'Login failed')
     }
   }, [loginError])
   ```

4. **Remove Character Filtering Alert**:
   - Filter silently or remove client-side filtering

5. **Fix Validation Schema**:
   - Fix `notOneOf` usage
   - Remove unused fields

### Medium-term Improvements

1. **Implement Token Encryption**:
   - Use `react-native-keychain` for secure storage

2. **Add Token Refresh**:
   - Implement refresh token mechanism
   - Auto-refresh before expiration

3. **Improve Error Messages**:
   - Specific error messages for different failure types
   - User-friendly messages

4. **Add Loading States**:
   - Loading indicator for biometric auth
   - Better loading feedback

5. **Remove Dead Code**:
   - Delete all commented code blocks

### Long-term Enhancements

1. **Add "Remember Me"**:
   - Option to stay logged in
   - Secure token storage

2. **Implement OAuth**:
   - Support for social login
   - Better security

3. **Add Two-Factor Authentication**:
   - SMS or email verification
   - Enhanced security

4. **Migrate to TypeScript**:
   - Type safety
   - Better IDE support

5. **Add Biometric Settings**:
   - User preference for biometric
   - Enable/disable option

---

## Dependencies

### What Authentication Depends On

- **Formik**: Form management
- **Yup**: Validation
- **Apollo Client**: GraphQL mutations
- **AsyncStorage**: Token persistence
- **expo-local-authentication**: Biometric auth
- **Firebase**: FCM token
- **DataContext**: Global state

### What Depends on Authentication

- **All authenticated screens**: Check `data.loged` flag
- **Apollo Client**: Uses token for all requests
- **Navigation**: Redirects based on auth state

---

## Summary

The authentication system is functional but has several issues:

1. **Security**: Password in memory, unencrypted token storage, no token expiration
2. **UX**: Auto-biometric trigger, annoying alerts, no loading states
3. **Code Quality**: Dead code, inconsistent patterns, no type safety

**Priority Fixes**:
1. Remove auto-biometric trigger
2. Remove password from context
3. Fix error handling
4. Remove dead code
5. Implement secure token storage

**Security Impact**: Current implementation has moderate security risks that should be addressed before production.

