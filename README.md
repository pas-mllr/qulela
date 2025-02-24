# QuLearnLabs

<div align="center">

![QuLeLa Banner](https://placehold.co/600x150/4a5568/FFFFFF/png?text=QuLeLa+for+VSCode)

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://marketplace.visualstudio.com/items?itemName=qulela.qulela)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VSCode Compatibility](https://img.shields.io/badge/VS%20Code-^1.97.0-brightgreen.svg)](https://code.visualstudio.com/)

</div>

## 📚 Overview

QuLeLa is an interactive VSCode extension that integrates directly with GitHub Copilot Chat to provide personalized programming instruction. Instead of providing direct answers, QuLeLa guides you through concepts with a teaching approach focused on understanding and learning.

## ✨ Features

- **Interactive Learning** - Learn programming concepts through guided explanations and examples
- **Contextual Conversations** - Ask follow-up questions naturally as QuLeLa maintains conversation context
- **Practice Exercises** - Generate custom exercises with the `/exercise` command to reinforce learning
- **Seamless Integration** - Works directly within GitHub Copilot Chat for a unified experience
- **Programming Focus** - Specialized in coding topics with relevant, practical explanations
- **Personalized Experience** - Set your name and experience level to tailor explanations

## 🛠️ Installation

1. Ensure you have [VSCode](https://code.visualstudio.com/) installed (version 1.97.0 or higher)
2. Make sure [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) are installed and configured
3. Install the QuLeLa extension using one of these methods:
   - Search for "QuLeLa" in the VSCode Extension Marketplace
   - [Download the VSIX](https://github.com/your-repo/qulela/releases) and install from VSIX
   - Use the command line: `code --install-extension qulela-0.0.1.vsix`

## 🚀 Getting Started

### Interactive Setup

When you install QuLeLa, an interactive walkthrough will guide you through:
1. Setting your name for personalized learning
2. Selecting your experience level (beginner, intermediate, advanced)
3. Learning how to interact with your AI tutor

You can access this walkthrough at any time from:
- The VS Code welcome page (under "Get Started")
- The command palette: `> QuLeLa: Set Your Name` or `> QuLeLa: Set Your Experience Level`

### Basic Usage

1. Open the GitHub Copilot Chat panel (Ctrl+Shift+I or Cmd+Shift+I)
2. Start a conversation with QuLeLa by typing:
   ```
   @qulela How do recursion and dynamic programming relate?
   ```
3. Continue the conversation naturally with follow-up questions

### Practice Mode

Generate practice exercises to reinforce learning:

```
/exercise implement a binary search tree in JavaScript
```

The tutor will create increasingly challenging exercises to help you master the concept.

## 📋 Example Use Cases

### Learning New Concepts
```
@qulela Explain closures in JavaScript
```

### Understanding Algorithms
```
@qulela How does quicksort work?
```

### Practicing Implementation
```
/exercise implement a REST API with Node.js
```

## 🔧 Configuration

The QuLeLa walkthrough helps you set:
- Your name (for personalized experience)
- Your programming experience level (beginner/intermediate/advanced)

These preferences are stored and used to tailor the learning experience.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built with [VSCode Extension API](https://code.visualstudio.com/api)
- Powered by [GitHub Copilot](https://github.com/features/copilot)

---

<div align="center">

**[Installation](#️-installation)** • 
**[Features](#-features)** • 
**[Getting Started](#-getting-started)** • 
**[Contributing](#-contributing)**

</div>