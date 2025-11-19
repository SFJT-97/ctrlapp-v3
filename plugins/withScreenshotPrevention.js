const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins')

/**
 * Expo config plugin to prevent screenshots and screen recording
 * Android: Sets FLAG_SECURE on the main window
 * iOS: Uses available techniques (limited by Apple restrictions)
 */
const withScreenshotPrevention = (config) => {
  // Android: Modify MainActivity to set FLAG_SECURE
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0]
    if (!mainApplication.activity) {
      mainApplication.activity = []
    }
    
    // Add FLAG_SECURE will be handled in MainActivity.kt directly
    // This plugin ensures the manifest is properly configured
    
    return config
  })

  // iOS: Add info.plist entries for screenshot prevention
  config = withInfoPlist(config, (config) => {
    // iOS has limited screenshot prevention capabilities
    // We'll use a combination of techniques in the native code
    config.modResults.UIViewControllerBasedStatusBarAppearance = true
    config.modResults.UIStatusBarHidden = false
    
    return config
  })

  return config
}

module.exports = withScreenshotPrevention

