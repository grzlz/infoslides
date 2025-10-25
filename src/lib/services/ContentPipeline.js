import { AIService } from './AIService.js';
import { DialogueSlideBuilder } from '../builders/DialogueSlideBuilder.js';
import { Speaker } from '../models/dialogue/Speaker.js';
import { Topic } from '../models/instagram/Topic.js';

/**
 * ContentPipeline - Orchestrates AI-powered dialogue generation
 * This is the main entry point for generating Kobe & Kanye dialogue content
 *
 * Flow:
 * 1. Get/create Topic
 * 2. Generate dialogue via AI (Claude)
 * 3. Build slide using DialogueSlideBuilder
 * 4. (Future: Render frames, composite video, export)
 *
 * For now, returns slide with dialogue data for testing
 */
export class ContentPipeline {
	/**
	 * @param {AIService} aiService - AI service instance
	 */
	constructor(aiService) {
		this.aiService = aiService;
	}

	/**
	 * Generate dialogue content for a topic
	 * @param {Object} options - Generation options
	 * @param {Topic|Object} options.topic - Topic to generate content for
	 * @param {boolean} [options.reviewMode=false] - If true, returns slide without publishing
	 * @returns {Promise<Object>} - Generated content with slide and metadata
	 */
	async generateDialogueContent({ topic, reviewMode = false }) {
		console.log(`[ContentPipeline] Generating dialogue for topic: ${topic.title}`);

		// Ensure topic is a Topic instance
		const topicObj = topic instanceof Topic ? topic : Topic.fromJSON(topic);

		// Step 1: Validate topic
		const topicValidation = topicObj.validate();
		if (!topicValidation.isValid) {
			throw new Error(
				`Invalid topic: ${topicValidation.errors.join(', ')}`
			);
		}

		// Step 2: Create speakers (Kobe & Kanye)
		const speakers = [Speaker.createKobeBryant(), Speaker.createKanyeWest()];

		// Step 3: Generate dialogue via AI
		console.log('[ContentPipeline] Calling AI service to generate dialogue...');
		const dialogueContent = await this.aiService.generateDialogue({
			topic: topicObj,
			speakers,
			format: 'instagram-reels',
			targetDuration: '30-45s'
		});

		console.log(
			`[ContentPipeline] Generated dialogue with ${dialogueContent.messages.length} messages, ` +
				`duration: ${Math.round(dialogueContent.duration / 1000)}s`
		);

		// Step 4: Validate generated dialogue
		const dialogueValidation = dialogueContent.validate();
		if (!dialogueValidation.isValid) {
			console.error('[ContentPipeline] Generated dialogue has errors:', dialogueValidation.errors);
			throw new Error(`Invalid dialogue generated: ${dialogueValidation.errors.join(', ')}`);
		}

		if (dialogueValidation.warnings.length > 0) {
			console.warn('[ContentPipeline] Dialogue warnings:', dialogueValidation.warnings);
		}

		// Step 5: Build slide using DialogueSlideBuilder
		console.log('[ContentPipeline] Building slide from dialogue...');
		const slide = DialogueSlideBuilder.buildFromDialogue(dialogueContent, {
			layout: 'instagram-reels-portrait',
			subtitle: `Day ${topicObj.scheduling.dayNumber || '?'} - ${topicObj.difficulty}`,
			instagramMetadata: {
				format: 'reels',
				aspectRatio: '4:5',
				targetDuration: dialogueContent.duration
			}
		});

		// Step 6: Validate slide
		if (!slide.validation.isValid) {
			console.error('[ContentPipeline] Slide validation failed:', slide.validation.errors);
			throw new Error(`Invalid slide: ${slide.validation.errors.join(', ')}`);
		}

		// Step 7: Return result
		const result = {
			success: true,
			slide: slide,
			dialogue: dialogueContent,
			topic: topicObj,
			metadata: {
				generatedAt: new Date().toISOString(),
				reviewMode,
				duration: dialogueContent.duration,
				messageCount: dialogueContent.messages.length,
				speakerCount: dialogueContent.speakers.length,
				validation: {
					isValid: slide.validation.isValid,
					errors: slide.validation.errors,
					warnings: slide.validation.warnings
				}
			}
		};

		console.log('[ContentPipeline] ✓ Content generation complete');

		return result;
	}

	/**
	 * Generate content for a specific day number
	 * @param {number} dayNumber - Day number in content schedule
	 * @param {Topic[]} topicLibrary - Array of available topics
	 * @returns {Promise<Object>}
	 */
	async generateDailyContent(dayNumber, topicLibrary) {
		const topic = topicLibrary.find((t) => t.scheduling.dayNumber === dayNumber);

		if (!topic) {
			throw new Error(`No topic found for day ${dayNumber}`);
		}

		return this.generateDialogueContent({ topic });
	}

	/**
	 * Batch generate content for multiple topics
	 * @param {Topic[]} topics - Array of topics
	 * @param {Object} [options] - Generation options
	 * @returns {Promise<Object[]>}
	 */
	async batchGenerate(topics, options = {}) {
		const results = [];
		const errors = [];

		for (const topic of topics) {
			try {
				console.log(`\n[ContentPipeline] Batch ${results.length + 1}/${topics.length}`);
				const result = await this.generateDialogueContent({ topic, ...options });
				results.push(result);

				// Add delay to avoid rate limiting
				if (options.delayMs && results.length < topics.length) {
					await new Promise((resolve) => setTimeout(resolve, options.delayMs));
				}
			} catch (error) {
				console.error(`[ContentPipeline] Failed for topic "${topic.title}":`, error.message);
				errors.push({
					topic: topic.title,
					error: error.message
				});
			}
		}

		return {
			results,
			errors,
			summary: {
				total: topics.length,
				successful: results.length,
				failed: errors.length
			}
		};
	}

	/**
	 * Create ContentPipeline from environment
	 * @returns {ContentPipeline}
	 */
	static fromEnv() {
		const aiService = AIService.fromEnv();
		return new ContentPipeline(aiService);
	}
}
