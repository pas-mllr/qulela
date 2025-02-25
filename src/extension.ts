// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const BASE_PROMPT =
  'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';

const EXERCISES_PROMPT =
  'You are a helpful tutor. Your job is to teach the user with fun, simple exercises that they can complete in the editor. Your exercises should start simple and get more complex as the user progresses. Move one concept at a time, and do not move on to the next concept until the user provides the correct answer. Give hints in your exercises to help the user learn. If the user is stuck, you can provide the answer and explain why it is the answer. If the user asks a non-programming question, politely decline to respond.';

const LESSON_PROMPT =
  'Here is the lesson content. Study it carefully and ask me any questions you have. I am here to help you understand the material fully.';

const HINTS_PROMPT =
  'Here are some helpful hints for the lesson. These hints will help guide you through the material without giving away the answers.';

// Storage keys
const USER_NAME_KEY = 'qulela.userName';
const EXPERIENCE_LEVEL_KEY = 'qulela.experienceLevel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Code Tutor chat participant is now active!');

  // define a chat handler
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    // Get user personalization data from extension context
    const userName = context.globalState.get(USER_NAME_KEY) as string || '';
    const experienceLevel = context.globalState.get(EXPERIENCE_LEVEL_KEY) as string || 'beginner';
    
    // Initialize the prompt with personalization
    let prompt = BASE_PROMPT;
    let lessonContent = '';

    // Modify prompt based on experience level and name
    if (userName) {
      prompt += ` The user's name is ${userName}.`;
    }
    
    prompt += ` The user's programming experience level is ${experienceLevel}.`;
    
    if (experienceLevel === 'beginner') {
      prompt += ' Use simple explanations with detailed step-by-step guidance.';
    } else if (experienceLevel === 'intermediate') {
      prompt += ' Balance detailed explanations with more advanced concepts.';
    } else if (experienceLevel === 'advanced') {
      prompt += ' Focus on advanced patterns, optimizations, and deeper technical details.';
    }

    if (request.command === 'exercise') {
      prompt = EXERCISES_PROMPT;
      
      // Add personalization to exercise prompt too
      if (userName) {
        prompt += ` The user's name is ${userName}.`;
      }
      
      prompt += ` The user's programming experience level is ${experienceLevel}.`;
      
      if (experienceLevel === 'beginner') {
        prompt += ' Create simpler exercises with more guidance.';
      } else if (experienceLevel === 'intermediate') {
        prompt += ' Create moderately challenging exercises.';
      } else if (experienceLevel === 'advanced') {
        prompt += ' Create challenging exercises that test deeper understanding.';
      }
    } else if (request.command === 'listLessons') {
      try {
        const lessonsDir = path.join(context.extensionUri.fsPath, 'lessons');
        const files = fs.readdirSync(lessonsDir);
        
        // Filter to just lesson files
        const lessonFiles = files.filter(file => file.startsWith('lesson-') && file.endsWith('.md'));
        
        if (lessonFiles.length > 0) {
          const lessonList = lessonFiles
            .map(file => {
              const match = file.match(/lesson-(\d+)\.md/);
              if (match) {
                return `Lesson ${match[1]}`;
              }
              return null;
            })
            .filter(Boolean)
            .join('\n- ');
          
          const message = `# Available Lessons\n\nHere are the lessons currently available:\n\n- ${lessonList}\n\nTo view a lesson, use \`/lesson <number>\`. For hints, use \`/hints <number>\`.`;
          stream.markdown(message);
        } else {
          stream.markdown("No lessons are currently available.");
        }
        return;
      } catch (error) {
        console.error(`Error listing lessons: ${error}`);
        stream.markdown("Sorry, there was an error listing the available lessons.");
        return;
      }
    } else if (request.command === 'lesson' || request.command === 'hints') {
      // Extract lesson number from the user's prompt
      const lessonMatch = request.prompt.match(/\b(\d+)\b/);
      const lessonNumber = lessonMatch ? lessonMatch[1] : '1'; // Default to lesson 1 if no number specified
      
      try {
        // Get the lesson or hints content
        const fileBaseName = request.command === 'lesson' ? 'lesson' : 'hints';
        const filePath = path.join(context.extensionUri.fsPath, 'lessons', `${fileBaseName}-${lessonNumber}.md`);
        
        if (fs.existsSync(filePath)) {
          lessonContent = fs.readFileSync(filePath, 'utf8');
          
          // If this is a lesson command, also open the file in the editor
          if (request.command === 'lesson') {
            // Create a URI for the file
            const fileUri = vscode.Uri.file(filePath);
            
            // Open the file in the editor
            vscode.window.showTextDocument(fileUri, {
              viewColumn: vscode.ViewColumn.One, // Open in the first editor column
              preview: false // Don't show it as a preview (temporary) tab
            }).then(() => {
              // Show a notification that the lesson is also open in the editor
              vscode.window.showInformationMessage(
                `Lesson ${lessonNumber} is now open in the editor for reference.`
              );
            });
          }
          
          // Set the appropriate prompt
          prompt = request.command === 'lesson' ? LESSON_PROMPT : HINTS_PROMPT;
          
          // Add personalization
          if (userName) {
            prompt += ` ${userName}, here's the content you requested:`;
          } else {
            prompt += ' Here\'s the content you requested:';
          }
          
          // Prepare a message for the chat that instructs the user about the open file
          if (request.command === 'lesson') {
            prompt += "\n\nI've also opened the lesson file in your editor for easy reference. You can switch between the chat and the editor to follow along.";
          }
          
          // Send a combined message instead of modifying request.prompt
          const combinedPrompt = `${prompt}\n\n${lessonContent}`;
          
          // Initialize messages with the combined prompt
          const messages = [vscode.LanguageModelChatMessage.User(combinedPrompt)];
          
          // Add previous messages
          const previousMessages = chatContext.history.filter(
            h => h instanceof vscode.ChatResponseTurn
          );
          
          previousMessages.forEach(m => {
            let fullMessage = '';
            m.response.forEach(r => {
              const mdPart = r as vscode.ChatResponseMarkdownPart;
              fullMessage += mdPart.value.value;
            });
            messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
          });
          
          // Add the user's original question at the end
          messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
          
          // Send the request
          const chatResponse = await request.model.sendRequest(messages, {}, token);
          
          // Stream the response
          for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
          }
          
          return;
        } else {
          // File not found
          const errorMessage = `Sorry, ${request.command} ${lessonNumber} is not available. Please try a different lesson number.`;
          stream.markdown(errorMessage);
          return;
        }
      } catch (error) {
        console.error(`Error reading lesson file: ${error}`);
        const errorMessage = `Sorry, there was an error accessing the ${request.command} content. Please try again later.`;
        stream.markdown(errorMessage);
        return;
      }
    }

    // initialize the messages array with the prompt
    const messages = [vscode.LanguageModelChatMessage.User(prompt)];

    // get all the previous participant messages
    const previousMessages = chatContext.history.filter(
      h => h instanceof vscode.ChatResponseTurn
    );

    // add the previous messages to the messages array
    previousMessages.forEach(m => {
      let fullMessage = '';
      m.response.forEach(r => {
        const mdPart = r as vscode.ChatResponseMarkdownPart;
        fullMessage += mdPart.value.value;
      });
      messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
    });

    // add in the user's message
    messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

    // send the request
    const chatResponse = await request.model.sendRequest(messages, {}, token);

    // stream the response
    for await (const fragment of chatResponse.text) {
      stream.markdown(fragment);
    }

    return;
  };

  // create participant
  const tutor = vscode.chat.createChatParticipant('qulela.tutor', handler);

  // add icon to participant
  tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'qulela.jpeg');

  // Register walkthrough commands
  context.subscriptions.push(
    vscode.commands.registerCommand('qulela.setName', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'What is your name?',
        placeHolder: 'Enter your name'
      });

      if (name) {
        // Store the name in global state
        await context.globalState.update(USER_NAME_KEY, name);
        vscode.window.showInformationMessage(`Hello, ${name}! Your preferences have been saved.`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('qulela.setExperienceLevel', async (args) => {
      const level = args?.level || 'beginner';
      
      // Store experience level in global state
      await context.globalState.update(EXPERIENCE_LEVEL_KEY, level);
      vscode.window.showInformationMessage(`Your experience level is now set to ${level}.`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('qulela.startLearning', async () => {
      // Open GitHub Copilot Chat
      await vscode.commands.executeCommand('workbench.action.chat.open');
      
      // Insert @qulela in the chat input
      await vscode.commands.executeCommand('workbench.action.chat.insertParticipant', 'qulela');
    })
  );
  
  // Register command to open the walkthrough directly
  context.subscriptions.push(
    vscode.commands.registerCommand('qulela.openWalkthrough', async () => {
      await vscode.commands.executeCommand('workbench.action.openWalkthrough', 'qulela.qulela#qulelaWalkthrough');
    })
  );

  // Always show the welcome notification on startup
  // We'll use a timeout to ensure it appears after VS Code is fully loaded
  setTimeout(() => {
    const welcomeAction = 'Open Walkthrough';
    vscode.window.showInformationMessage(
      'Welcome to QuLeLa! Would you like to set up your personalized learning experience?',
      welcomeAction
    ).then(selection => {
      if (selection === welcomeAction) {
        vscode.commands.executeCommand('workbench.action.openWalkthrough', 'qulela.qulela#qulelaWalkthrough');
      }
    });
  }, 2000); // 2-second delay
}

// This method is called when your extension is deactivated
export function deactivate() {}
