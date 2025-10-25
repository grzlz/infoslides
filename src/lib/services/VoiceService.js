import { VoiceFactory } from '../factories/VoiceFactory.js';

/**
 * VoiceService - Provider-agnostic voice generation
 * Orchestrates text-to-speech using pluggable voice strategies
 *
 * Supports:
 * - OpenAI TTS (fast, good quality)
 * - ElevenLabs (best quality, voice cloning)
 * - Per-speaker provider overrides
 * - Batch dialogue generation
 */
export class VoiceService {
	/**
	 * @param {VoiceStrategy} voiceStrategy - Voice provider strategy
	 */
	constructor(voiceStrategy) {
		this.voiceStrategy = voiceStrategy;
	}

	/**
	 * Generate speech for a single message
	 * @param {string} text - Message text
	 * @param {Speaker} speaker - Speaker with voiceProfile
	 * @returns {Promise<Object>} { audioPath, duration, format, provider, metadata }
	 */
	async generateMessageAudio(text, speaker) {
		if (!text || text.trim().length === 0) {
			throw new Error('Cannot generate audio for empty text');
		}

		console.log(
			`[VoiceService] Generating audio for ${speaker.name} via ${this.voiceStrategy.getProviderName()}`
		);
		console.log(`[VoiceService] Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

		try {
			const result = await this.voiceStrategy.generateSpeech(text, speaker.voiceProfile);

			console.log(`[VoiceService] ✓ Generated: ${result.audioPath}`);

			return result;
		} catch (error) {
			console.error(`[VoiceService] Failed to generate audio for ${speaker.name}:`, error);
			throw new Error(this.voiceStrategy.formatError(error));
		}
	}

	/**
	 * Generate audio for entire dialogue
	 * Creates individual audio files for each message
	 * @param {DialogueContent} dialogue - Dialogue with messages and speakers
	 * @returns {Promise<Object[]>} Array of audio files with metadata
	 */
	async generateDialogueAudio(dialogue) {
		console.log(
			`[VoiceService] Generating audio for dialogue with ${dialogue.messages.length} messages`
		);

		const audioFiles = [];
		const errors = [];

		for (let i = 0; i < dialogue.messages.length; i++) {
			const message = dialogue.messages[i];
			const speaker = dialogue.getSpeakerById(message.speakerId);

			if (!speaker) {
				const error = `Speaker ${message.speakerId} not found for message ${i + 1}`;
				console.warn(`[VoiceService] ${error}, skipping`);
				errors.push({ messageIndex: i, error });
				continue;
			}

			try {
				const audio = await this.generateMessageAudio(message.text, speaker);

				audioFiles.push({
					messageId: message.id || `message-${i}`,
					messageIndex: i,
					speakerId: speaker.id,
					speakerName: speaker.name,
					text: message.text,
					timestamp: message.timestamp,
					...audio
				});

				// Small delay to avoid rate limiting
				if (i < dialogue.messages.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 500));
				}
			} catch (error) {
				console.error(`[VoiceService] Failed to generate audio for message ${i + 1}:`, error);
				errors.push({
					messageIndex: i,
					speakerId: speaker.id,
					error: error.message
				});
			}
		}

		console.log(
			`[VoiceService] ✓ Generated ${audioFiles.length}/${dialogue.messages.length} audio files`
		);

		if (errors.length > 0) {
			console.warn(`[VoiceService] ${errors.length} errors occurred during generation`);
		}

		return {
			audioFiles,
			errors,
			summary: {
				total: dialogue.messages.length,
				successful: audioFiles.length,
				failed: errors.length,
				totalDuration: audioFiles.reduce((sum, audio) => sum + audio.duration, 0),
				provider: this.voiceStrategy.getProviderName()
			}
		};
	}

	/**
	 * Generate audio for specific messages only
	 * @param {Message[]} messages - Array of messages
	 * @param {Speaker[]} speakers - Array of speakers
	 * @returns {Promise<Object[]>}
	 */
	async generateMessagesAudio(messages, speakers) {
		const audioFiles = [];

		for (const message of messages) {
			const speaker = speakers.find((s) => s.id === message.speakerId);

			if (!speaker) {
				console.warn(`[VoiceService] Speaker ${message.speakerId} not found, skipping`);
				continue;
			}

			const audio = await this.generateMessageAudio(message.text, speaker);
			audioFiles.push({
				messageId: message.id,
				speakerId: speaker.id,
				...audio
			});
		}

		return audioFiles;
	}

	/**
	 * Validate voice service configuration
	 * @returns {Promise<Object>} { isValid, provider, errors }
	 */
	async validate() {
		const isValid = await this.voiceStrategy.validateProvider();
		const provider = this.voiceStrategy.getProviderName();

		return {
			isValid,
			provider,
			errors: isValid ? [] : [`${provider} provider is not properly configured`]
		};
	}

	/**
	 * Get service information
	 * @returns {Object}
	 */
	getInfo() {
		return {
			provider: this.voiceStrategy.getProviderName(),
			hasApiKey: Boolean(this.voiceStrategy.apiKey)
		};
	}

	/**
	 * Create VoiceService from environment configuration
	 * Uses VOICE_PROVIDER env var to select provider
	 * @returns {VoiceService}
	 */
	static fromEnv() {
		const strategy = VoiceFactory.createFromEnv();
		return new VoiceService(strategy);
	}

	/**
	 * Create VoiceService for specific provider
	 * @param {string} provider - Provider name (openai, elevenlabs, etc.)
	 * @returns {VoiceService}
	 */
	static withProvider(provider) {
		const strategy = VoiceFactory.createFromEnv(provider);
		return new VoiceService(strategy);
	}

	/**
	 * Get provider information from factory
	 * @returns {Object}
	 */
	static getProviderInfo() {
		return VoiceFactory.getProviderInfo();
	}
}
