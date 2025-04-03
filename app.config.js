module.exports = {
  expo: {
    name: "TaskMaster",
    slug: "taskmaster",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.taskmaster"
    },
    android: {
      package: "com.yourcompany.taskmaster"
    },
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 