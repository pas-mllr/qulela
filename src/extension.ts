// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const BASE_PROMPT =
  'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';

const EXERCISES_PROMPT =
  'You are a helpful tutor. Your job is to teach the user with fun, simple exercises that they can complete in the editor. Your exercises should start simple and get more complex as the user progresses. Move one concept at a time, and do not move on to the next concept until the user provides the correct answer. Give hints in your exercises to help the user learn. If the user is stuck, you can provide the answer and explain why it is the answer. If the user asks a non-programming question, politely decline to respond.';

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

  // Check if this is first run to show welcome notification
  const hasShownWelcome = context.globalState.get('qulela.hasShownWelcome');
  if (!hasShownWelcome) {
    const welcomeAction = 'Open Walkthrough';
    vscode.window.showInformationMessage(
      'Welcome to QuLeLa! Would you like to set up your personalized learning experience?',
      welcomeAction
    ).then(selection => {
      if (selection === welcomeAction) {
        vscode.commands.executeCommand('workbench.action.openWalkthrough', 'qulela.qulela#qulelaWalkthrough');
      }
    });
    context.globalState.update('qulela.hasShownWelcome', true);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
