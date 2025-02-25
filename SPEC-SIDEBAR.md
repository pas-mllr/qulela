# QuLeLa VSCode Sidebar Extension Specification

## Overview

This specification details the implementation of a dedicated sidebar view for the QuLeLa extension. The sidebar will enhance user experience by providing easy access to course materials, tutorials, and personalization settings without requiring command usage.

## Goals

- Increase visibility and discoverability of QuLeLa features
- Provide convenient access to course information and learning resources
- Allow users to manage their preferences directly through a GUI
- Create a more immersive and integrated learning experience within VSCode

## Feature Specifications

### 1. Sidebar Integration

#### 1.1 Extension Activation

- The sidebar view should be registered during extension activation
- A QuLeLa icon should appear in the VSCode activity bar (left sidebar)
- Clicking the icon should open the QuLeLa sidebar panel

#### 1.2 Technical Implementation

```typescript
// Register the sidebar view
const provider = new QuLeLaSidebarViewProvider(context.extensionUri, context);
context.subscriptions.push(
  vscode.window.registerWebviewViewProvider(
    'quLeLaSidebar',
    provider,
    { webviewOptions: { retainContextWhenHidden: true } }
  )
);
```

#### 1.3 Package.json Contributions

```json
"contributes": {
  "views": {
    "explorer": [{
      "id": "quLeLaSidebar",
      "name": "QuLeLa",
      "icon": "media/qulela-icon.svg",
      "contextualTitle": "QuLeLa Learning Assistant"
    }]
  },
  "viewsContainers": {
    "activitybar": [{
      "id": "quLeLa-sidebar",
      "title": "QuLeLa",
      "icon": "media/qulela-icon.svg"
    }]
  }
}
```

### 2. Tabbed Interface

#### 2.1 Tab Structure

The sidebar should contain the following tabs:
1. **Course Info** - Display information from course-syllabus.md
2. **Tutorial** - Show instructions from tutorial.md
3. **Settings** - Allow users to modify their preferences

#### 2.2 UI Implementation

- Use HTML/CSS tabs within the webview
- Track active tab in the webview state
- Preserve active tab between VSCode sessions

#### 2.3 Tab Navigation Code

```typescript
// HTML for tabs
const tabsHtml = `
  <div class="tabs">
    <button class="tab-button ${activeTab === 'course' ? 'active' : ''}" data-tab="course">Course Info</button>
    <button class="tab-button ${activeTab === 'tutorial' ? 'active' : ''}" data-tab="tutorial">Tutorial</button>
    <button class="tab-button ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">Settings</button>
  </div>
  <div class="tab-content">
    <div id="course-content" class="tab-pane ${activeTab === 'course' ? 'active' : ''}">
      ${courseContent}
    </div>
    <div id="tutorial-content" class="tab-pane ${activeTab === 'tutorial' ? 'active' : ''}">
      ${tutorialContent}
    </div>
    <div id="settings-content" class="tab-pane ${activeTab === 'settings' ? 'active' : ''}">
      ${settingsContent}
    </div>
  </div>
`;
```

### 3. Course Information Tab

#### 3.1 Content Source

- Create a new file `course-syllabus.md` in the project root
- File should contain course overview, structure, and learning objectives
- Support Markdown formatting including headers, lists, tables, and code blocks

#### 3.2 Implementation Details

- Read the `course-syllabus.md` file and convert its content to HTML
- Display the HTML content in the "Course Info" tab
- Implement auto-refresh when the source file changes

#### 3.3 Technical Approach

```typescript
async function getCourseContent(extensionUri: vscode.Uri): Promise<string> {
  const filePath = vscode.Uri.joinPath(extensionUri, 'course-syllabus.md');
  try {
    const content = await vscode.workspace.fs.readFile(filePath);
    // Convert Markdown to HTML
    return markdownIt.render(content.toString());
  } catch (error) {
    console.error('Error reading course syllabus:', error);
    return '<p>Error loading course information.</p>';
  }
}
```

### 4. Tutorial Tab

#### 4.1 Content Source

- Create a new file `tutorial.md` in the project root
- File should contain instructions on how to use the extension
- Include screenshots and step-by-step guides

#### 4.2 Implementation Details

- Read the `tutorial.md` file and convert its content to HTML
- Display the HTML content in the "Tutorial" tab
- Support embedded images and rich formatting
- Include command buttons that trigger QuLeLa commands when clicked

#### 4.3 Command Integration

```typescript
// Add command buttons to the tutorial content
function addCommandButtons(htmlContent: string): string {
  return htmlContent.replace(
    /\{\{command:([^}]+)\}\}/g, 
    (match, command) => {
      const [commandId, label] = command.split('|');
      return `<button class="command-button" data-command="${commandId}">${label || commandId}</button>`;
    }
  );
}
```

### 5. Settings Tab

#### 5.1 User Preferences

Allow users to configure:
- **Name**: Text input for user's name
- **Experience Level**: Radio buttons for beginner/intermediate/advanced
- **Appearance**: Toggle for light/dark theme integration
- **Notifications**: Checkbox for enabling/disabling notifications

#### 5.2 UI Implementation

```html
<div class="settings-section">
  <h3>Personal Information</h3>
  <div class="setting-item">
    <label for="username">Your Name:</label>
    <input type="text" id="username" value="${currentName || ''}">
  </div>
  
  <h3>Learning Preferences</h3>
  <div class="setting-item">
    <label>Experience Level:</label>
    <div class="radio-group">
      <label>
        <input type="radio" name="experience" value="beginner" ${currentLevel === 'beginner' ? 'checked' : ''}>
        Beginner
      </label>
      <label>
        <input type="radio" name="experience" value="intermediate" ${currentLevel === 'intermediate' ? 'checked' : ''}>
        Intermediate
      </label>
      <label>
        <input type="radio" name="experience" value="advanced" ${currentLevel === 'advanced' ? 'checked' : ''}>
        Advanced
      </label>
    </div>
  </div>
  
  <div class="setting-item">
    <button id="save-settings" class="primary-button">Save Settings</button>
  </div>
</div>
```

#### 5.3 Storage Implementation

```typescript
// Save user preferences
async function saveUserPreferences(context: vscode.ExtensionContext, name: string, level: string): Promise<void> {
  await context.globalState.update(USER_NAME_KEY, name);
  await context.globalState.update(EXPERIENCE_LEVEL_KEY, level);
  vscode.window.showInformationMessage('QuLeLa settings saved successfully!');
}
```

### 6. Webview Provider Implementation

#### 6.1 Core Class Structure

```typescript
class QuLeLaSidebarViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private _context: vscode.ExtensionContext;
  
  constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._extensionUri = extensionUri;
    this._context = context;
  }
  
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    
    // Configure webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    // Set initial HTML content
    this.updateWebview();
    
    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(this.handleMessage.bind(this));
  }
  
  private async updateWebview() {
    if (!this._view) {
      return;
    }
    
    const courseContent = await getCourseContent(this._extensionUri);
    const tutorialContent = await getTutorialContent(this._extensionUri);
    const settingsContent = this.getSettingsContent();
    
    this._view.webview.html = this.getHtmlForWebview(
      this._view.webview,
      courseContent,
      tutorialContent,
      settingsContent
    );
  }
  
  private handleMessage(message: any) {
    // Handle messages from the webview
    switch (message.command) {
      case 'saveSettings':
        this.saveSettings(message.name, message.level);
        break;
      case 'switchTab':
        // Store active tab preference
        this._context.globalState.update('qulela.activeTab', message.tab);
        break;
      case 'executeCommand':
        vscode.commands.executeCommand(message.commandId);
        break;
    }
  }
  
  // Additional helper methods...
}
```

#### 6.2 HTML Template

Create an HTML template that includes:
- CSS for styling (with support for VSCode theme variables)
- JavaScript for tab switching and form handling
- Content containers for each tab

### 7. File Structure

```
qulela/
├── src/
│   ├── extension.ts                 # Main extension code
│   ├── sidebarViewProvider.ts       # Sidebar webview provider
│   └── utilities/
│       ├── markdownConverter.ts     # Markdown to HTML conversion
│       └── stateManager.ts          # Manage user preferences
├── media/
│   ├── qulela-icon.svg              # Sidebar icon
│   ├── main.css                     # Sidebar styles
│   └── sidebar.js                   # Sidebar interaction scripts
├── course-syllabus.md               # Course information
└── tutorial.md                      # Extension usage tutorial
```

## Implementation Plan

### Phase 1: Basic Structure (Days 1-2)

1. Create sidebar view container and provider class
2. Implement basic tab switching functionality
3. Design and implement initial CSS styling

### Phase 2: Content Integration (Days 3-4)

1. Create course-syllabus.md and tutorial.md files
2. Implement Markdown to HTML conversion
3. Display content in respective tabs

### Phase 3: Settings Management (Days 5-6)

1. Create settings UI form
2. Implement settings storage and retrieval
3. Connect settings to existing personalization features

### Phase 4: Polish and Testing (Days 7-8)

1. Ensure proper theming and responsiveness
2. Add loading states and error handling
3. Comprehensive testing across platforms
4. Document the new features

## Technical Considerations

### Security

- Sanitize Markdown content before rendering to HTML
- Use Content Security Policy in webview
- Validate all user inputs

### Performance

- Implement lazy loading for tab content
- Cache converted Markdown content
- Use efficient state management

### Accessibility

- Ensure keyboard navigation for tabs
- Use semantic HTML elements
- Follow WCAG guidelines for color contrast

## Future Enhancements

- Course progress tracking
- Integrated mini-quizzes in the sidebar
- Lesson bookmarking functionality
- Dark/light theme customization for course content

---

This specification serves as a comprehensive guide for implementing the QuLeLa sidebar extension, providing a detailed roadmap for development while maintaining flexibility for refinement during implementation.