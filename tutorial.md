# QuLeLa Extension Tutorial

Welcome to the QuLeLa (Quantum Learning Lab) extension for VS Code! This tutorial will guide you through using all the features of the extension to enhance your quantum computing learning experience.

## Getting Started

### Installation Requirements

Before using QuLeLa, ensure you have:

1. VS Code (version 1.97.0 or higher)
2. GitHub Copilot and GitHub Copilot Chat extensions installed and configured
3. The QuLeLa extension installed

### Initial Setup

When you first install QuLeLa, a walkthrough will automatically appear. If you don't see it, you can access it anytime:

1. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "QuLeLa: Open Getting Started Walkthrough"
3. Follow the steps to set your name and experience level

**Quick Start:** Click the button below to open the walkthrough now:

{{command:qulela.openWalkthrough|Open Walkthrough}}

## Using the QuLeLa Sidebar

The QuLeLa sidebar provides quick access to all extension features:

1. Click the QuLeLa icon in the activity bar (left side of VS Code)
2. Navigate between tabs to access different features:
   - **Course Info**: Review the curriculum structure
   - **Tutorial**: Access this guide at any time
   - **Settings**: Change your name and experience level

## Learning with QuLeLa

### Accessing Lessons

There are two ways to access lessons:

1. **Via Command**:
   - Open the GitHub Copilot Chat panel
   - Type `/lesson` followed by the lesson number (e.g., `/lesson 1`)
   - The lesson will open in Markdown preview and QuLeLa will respond in the chat

2. **Via List Command**:
   - Type `/listLessons` to see all available lessons
   - Click on any lesson number to open it

**Try It Now:** {{command:qulela.startLearning|Start Learning}}

### Getting Hints

When you're stuck on a lesson:

1. Type `/hints` followed by the lesson number (e.g., `/hints 1`)
2. QuLeLa will provide guidance without giving away the answers

### Practice Exercises

Generate custom practice exercises:

1. Type `/exercise` followed by a topic
2. Example: `/exercise quantum teleportation` or `/exercise implement a quantum circuit`
3. QuLeLa will create exercises tailored to your experience level

## Asking Questions

QuLeLa integrates with GitHub Copilot Chat to answer your quantum computing questions:

1. Open GitHub Copilot Chat
2. Type `@qulela` followed by your question
3. Example: `@qulela How does quantum entanglement work?`
4. Continue the conversation naturally with follow-up questions

## Customizing Your Experience

You can customize your learning experience through the Settings tab in the sidebar or via commands:

- Change your name: {{command:qulela.setName|Change Name}}
- Change experience level: {{command:qulela.setExperienceLevel|Change Experience Level}}

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Copilot Chat | Ctrl+Shift+I (or Cmd+Shift+I on macOS) |
| Open Command Palette | Ctrl+Shift+P (or Cmd+Shift+P on macOS) |
| Toggle QuLeLa Sidebar | Click the QuLeLa icon in activity bar |

## Troubleshooting

If you encounter issues:

1. **QuLeLa doesn't appear in the sidebar**:
   - Ensure the extension is installed correctly
   - Reload VS Code (Ctrl+R or Cmd+R)

2. **Commands not working**:
   - Verify GitHub Copilot Chat is properly configured
   - Check that you're typing the commands correctly with the slash (/) prefix

3. **Lesson content doesn't load**:
   - Ensure you have the latest version of the extension
   - Check for any error messages in the VS Code Developer Console

## Getting Help

If you need assistance with the extension:

1. Check this tutorial for guidance
2. Ask QuLeLa directly using `@qulela help` in the chat
3. Report issues on our [GitHub repository](https://github.com/qulearnlabs/qulela/issues)

---

Ready to start learning? Try opening the first lesson with the command below:

{{command:qulela.startLearning|Start Learning with Lesson 1}}