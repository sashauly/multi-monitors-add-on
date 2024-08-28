# Roadmap for MultiMonitors AddOn

Maybe it needs to be rewritten from scratch. I'm not sure. But whatever.

## Current Status

- Project started: [27.08.2024]
- Last update: [28.08.2024]

Currently working on `gnome-42-44 branch`. First I need to fix existing issues and then I will start working on new features, move all to gtk4, adw and other stuff(possibly TS?).

## Key Milestones

## Improve Existing Functionality

1. **Enhanced Configuration Options**:
   - Add more granular settings for panel positioning, sizing, and appearance.
   - Implement a settings dialog for easier configuration.

2. **Better Multi-Monitor Support**:
   - Implement automatic detection of connected monitors.
   - Allow users to specify which monitors to use for the panel.

3. **Improved Window Management**:
   - Enhance window snapping and tiling functionality.
   - Add support for multiple virtual desktops per monitor.

4. **Customization Options**:
   - Add more theme customization options (colors, fonts, etc.).
   - Implement a color picker for accent colors.

5. **Performance Optimization**:
   - Implement caching for frequently accessed data.
   - Optimize redraw operations for smoother performance.

### Fix Known Issues

1. **Enable/Disable Slider Issue**:
   - Investigate why the enable/disable slider isn't working as expected.
   - Ensure proper communication with the GNOME Extensions API.

2. **Settings Persistence**:
   - Fix the issue where settings aren't saved after reboots.
   - Implement proper storage and retrieval of settings.

3. **Inconsistent Behavior Across Monitors**:
   - Ensure consistent behavior for panels on all connected monitors.
   - Fix issues with the top bar and side bar not appearing on all monitors.

### Add New Features

1. **Intellihide Feature**:
   - Implement an "intellihide" option to hide inactive panels and save screen space.

2. **Window Previews**:
   - Add window preview functionality for easier navigation.

3. **Custom Applets**:
   - Allow users to add custom applets to the panel.

4. **Media Controls**:
   - Implement media controls for easy access to music, videos, etc.

5. **Clipboard History**:
   - Add a clipboard history feature, similar to the Clipboard Indicator extension.

### Organize and Refactor Code

1. **Modular Architecture**:
   - Restructure the codebase into separate modules for different functionalities.
   - Use ES6 modules for better organization and import/export.

2. **Separation of Concerns**:
   - Move UI-related logic to separate files.
   - Keep core functionality in a single file for easier maintenance.

3. **Error Handling**:
   - Implement robust error handling throughout the extension.
   - Add logging for debugging purposes.

4. **Testing Framework**:
   - Set up a testing framework to ensure stability across different GNOME versions.

5. **Documentation**:
   - Improve inline comments and add README documentation.
   - Create a wiki page for advanced users and developers.

6. **Code Style Consistency**:
   - Ensure consistent coding style across all files.
   - Use linters and formatters to maintain consistency.

7. **Version Control**:
   - Organize commits logically using semantic versioning.
   - Write clear commit messages explaining changes.

8. **Continuous Integration**:
   - Set up CI/CD pipelines to automatically test builds after each commit.

9. **Translation Support**:
   - Implement proper translation support for multi-language environments.

10. **Performance Monitoring**:
    - Add performance monitoring tools to track memory usage and execution times.
