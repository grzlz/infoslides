import { DialogueContent } from '../models/dialogue/DialogueContent.js';
import { Speaker } from '../models/dialogue/Speaker.js';
import { Message } from '../models/dialogue/Message.js';
import { CodeBlock } from '../models/dialogue/CodeBlock.js';

/**
 * AIService handles AI-powered content generation using Claude API
 * Generates Kobe & Kanye dialogue content for Go programming topics
 */
export class AIService {
	/**
	 * @param {string} apiKey - Anthropic API key
	 */
	constructor(apiKey) {
		this.apiKey = apiKey;
		this.apiUrl = 'https://api.anthropic.com/v1/messages';
		this.model = 'claude-3-5-sonnet-20241022';
	}

	/**
	 * Generate dialogue content for a Go programming topic
	 * @param {Object} options - Generation options
	 * @param {Object} options.topic - Topic object with title, description, keywords
	 * @param {Speaker[]} options.speakers - Array of speakers (Kobe & Kanye)
	 * @param {string} [options.format='instagram-reels'] - Content format
	 * @param {string} [options.targetDuration='20-60s'] - Target duration
	 * @returns {Promise<DialogueContent>}
	 */
	async generateDialogue({ topic, speakers, format = 'instagram-reels', targetDuration = '20-60s' }) {
		const kobe = speakers.find((s) => s.role === 'expert') || Speaker.createKobeBryant();
		const kanye = speakers.find((s) => s.role === 'novice') || Speaker.createKanyeWest();

		const prompt = this.buildDialoguePrompt(topic, kobe, kanye, format, targetDuration);

		try {
			const response = await this.callClaudeAPI(prompt);
			const dialogueData = this.parseDialogueResponse(response, kobe, kanye);
			return this.buildDialogueContent(topic, dialogueData, kobe, kanye);
		} catch (error) {
			console.error('AI dialogue generation failed:', error);
			throw new Error(`Failed to generate dialogue: ${error.message}`);
		}
	}

	/**
	 * Build the prompt for Claude API
	 * @private
	 */
	buildDialoguePrompt(topic, kobe, kanye, format, targetDuration) {
		return `You are generating a dialogue for an Instagram Reels video teaching Go programming.

**Format**: ${format}
**Duration**: ${targetDuration} (target 30-45 seconds)
**Topic**: ${topic.title}
**Description**: ${topic.description || 'No description provided'}
**Keywords**: ${topic.keywords?.join(', ') || 'Go programming'}
**Difficulty**: ${topic.difficulty || 'beginner'}

**Characters**:
1. **${kobe.name}** (Expert)
   - Role: ${kobe.personality.description}
   - Tone: ${kobe.personality.tone}
   - Style: ${kobe.personality.speakingStyle}

2. **${kanye.name}** (Novice)
   - Role: ${kanye.personality.description}
   - Tone: ${kanye.personality.tone}
   - Style: ${kanye.personality.speakingStyle}

**Content Formula**:
1. Kobe asks a technical question or makes a statement about the topic
2. Kobe explains with rapid-fire technical details (1-2 sentences max)
3. Kanye interrupts with confusion, ALL CAPS outburst, or makes it about himself
4. Kobe simplifies with a sports/discipline analogy
5. (Optional) Include a small code snippet if relevant

**Requirements**:
- 4-6 messages total (alternating speakers)
- Each message: 50-150 characters max (mobile-friendly)
- Include at least one Kanye interruption (isInterruption: true)
- If code is needed, keep it under 5 lines
- Total dialogue should feel like 30-45 seconds of reading/speaking time

**Output Format** (JSON only, no markdown):
{
  "messages": [
    {
      "speaker": "KOBE BRYANT" or "KANYE WEST",
      "text": "message text here",
      "isInterruption": false,
      "timestamp": 0,
      "codeBlock": null or {
        "code": "package main\\nfunc main() {}",
        "language": "go",
        "theme": "dark"
      }
    }
  ]
}

Generate the dialogue now. Return ONLY valid JSON, no other text.`;
	}

	/**
	 * Call Claude API
	 * @private
	 */
	async callClaudeAPI(prompt) {
		const response = await fetch(this.apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': this.apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 1024,
				messages: [
					{
						role: 'user',
						content: prompt
					}
				]
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Claude API error (${response.status}): ${errorText}`);
		}

		const data = await response.json();
		return data.content[0].text;
	}

	/**
	 * Parse Claude's response into structured dialogue data
	 * @private
	 */
	parseDialogueResponse(responseText, kobe, kanye) {
		// Extract JSON from response (Claude might wrap it in markdown)
		let jsonText = responseText.trim();

		// Remove markdown code blocks if present
		jsonText = jsonText.replace(/^```json?\n?/i, '').replace(/\n?```$/, '');

		try {
			return JSON.parse(jsonText);
		} catch (error) {
			console.error('Failed to parse AI response:', responseText);
			throw new Error(`Invalid JSON response from AI: ${error.message}`);
		}
	}

	/**
	 * Build DialogueContent from parsed data
	 * @private
	 */
	buildDialogueContent(topic, dialogueData, kobe, kanye) {
		const dialogue = DialogueContent.createKobeKanyeTemplate(topic.title);

		let currentTimestamp = 0;
		const readingSpeed = 50; // ms per character

		dialogueData.messages.forEach((msgData, index) => {
			const speaker = msgData.speaker === kobe.name ? kobe : kanye;
			const message = new Message();

			message.speakerId = speaker.id;
			message.text = msgData.text;
			message.order = index;
			message.timestamp = currentTimestamp;
			message.isInterruption = msgData.isInterruption || false;

			// Add code block if present
			if (msgData.codeBlock) {
				const codeBlock = new CodeBlock();
				codeBlock.code = msgData.codeBlock.code;
				codeBlock.language = msgData.codeBlock.language || 'go';
				codeBlock.theme = msgData.codeBlock.theme || 'dark';
				codeBlock.showLineNumbers = false; // Keep it simple for mobile
				message.attachCodeBlock(codeBlock);
			}

			// Set animation
			message.setAnimation('fade-in', 300, 0);

			dialogue.addMessage(message);

			// Calculate next timestamp (reading time + pause)
			const messageReadingTime = message.text.length * readingSpeed;
			const pauseTime = message.isInterruption ? 200 : 500; // Shorter pause for interruptions
			currentTimestamp += messageReadingTime + pauseTime;
		});

		return dialogue;
	}

	/**
	 * Create AIService instance from environment variables
	 * @returns {AIService}
	 */
	static fromEnv() {
		const apiKey = process.env.ANTHROPIC_API_KEY || '';
		if (!apiKey) {
			throw new Error('ANTHROPIC_API_KEY environment variable is required');
		}
		return new AIService(apiKey);
	}
}
