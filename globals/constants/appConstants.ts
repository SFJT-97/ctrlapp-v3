// Application-wide constants

// Loading and Error States
export const LOADING_STATE = 'Loading...'
export const ERROR_STATE = 'ApolloError'
export const LOADING_STATE_LOWERCASE = 'loading...'

// Polling Intervals (in milliseconds)
export const CHAT_POLL_INTERVAL = 5000 // 5 seconds
export const CHAT_POLL_INTERVAL_BACKGROUND = 0 // Disabled
export const TICKET_WATCH_INTERVAL = 30000 // 30 seconds
export const VALUES_WATCH_INTERVAL = 120000 // 2 minutes

// Chat Limits
export const MAX_CHAT_MESSAGE_LENGTH = 140
export const MAX_CHAT_LIST_ITEMS = 50

// Profile Validation Patterns
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^[0-9]{10,12}$/
export const ADDRESS_PATTERN = /^[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ,. ]{5,}$/

// Character Restrictions
export const NOT_ALLOWED_CHARACTERS = [
  '*',
  '%',
  '(',
  ')',
  '>',
  '/',
  '<',
  '=',
  '"',
  '\\',
  '`',
  "'"
]

// Cache Configuration
export const APOLLO_CACHE_MAX_SIZE = 1048576 // 1MB

// Time Constants
export const DEBOUNCE_DELAY = 300 // milliseconds
export const TIMEOUT_DELAY = 2000 // 2 seconds

// Orientation Constants
export const ORIENTATION_PORTRAIT = 1
export const ORIENTATION_LANDSCAPE = 2

// Default Values
export const DEFAULT_THEME = 'light'
export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_SHOW_NOTIFICATIONS_TO_LEVEL = 1

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  LOAD_ERROR: 'Failed to load data. Please try again.',
  SAVE_ERROR: 'Failed to save. Please try again.',
  VALIDATION_ERROR: 'Please check the provided information.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Saved successfully.',
  UPDATE_SUCCESS: 'Updated successfully.',
  DELETE_SUCCESS: 'Deleted successfully.'
} as const

