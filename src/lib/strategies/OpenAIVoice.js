import { VoiceStrategy } from './VoiceStrategy.js';
import fs from 'fs';
import path from 'path';

/**
 * OpenAI Text-to-Speech voice strategy
 * Uses OpenAI's TTS API for voice generation
 *
 * Available voices: alloy, echo, fable, onyx, nova, shimmer
 * Models: tts-1 (fast), tts-1-hd (high quality)
 *
 * Pricing: $15 per 1M characters (as of 2024)
 */
export class OpenAIVoice extends VoiceStrategy {
	constructor(apiKey) {
		super(apiKey);
		this.apiUrl = 'https://api.openai.com/v1/audio/speech';
	}

	/**
	 * Generate speech using OpenAI TTS
	 * @param {string} text - Text to speak
	 * @param {Object} voiceProfile - Voice configuration
	 * @returns {Promise<Object>} { audioPath, duration, format, provider }
	 */
	async generateSpeech(text, voiceProfile) {
		if (!this.apiKey) {
			throw new Error('OpenAI API key is required for voice generation');
		}

		const voice = voiceProfile.voiceId || 'onyx';
		const model = voiceProfile.model || 'tts-1';
		const speed = voiceProfile.speed || 1.0;

		const response = await fetch(this.apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model,
				voice,
				input: text,
				speed,
				response_format: 'mp3'
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`OpenAI TTS API error (${response.status}): ${errorText}`);
		}

		// Create output directory
		const outputDir = path.join(process.cwd(), 'output', 'audio');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 9);
		const filename = `openai-${voice}-${timestamp}-${random}.mp3`;
		const audioPath = path.join(outputDir, filename);

		// Save audio file
		const buffer = Buffer.from(await response.arrayBuffer());
		fs.writeFileSync(audioPath, buffer);

		const duration = this.estimateDuration(text);

		return {
			audioPath,
			duration,
			format: 'mp3',
			provider: this.getProviderName(),
			metadata: {
				voice,
				model,
				speed,
				textLength: text.length,
				generatedAt: new Date().toISOString()
			}
		};
	}

	/**
	 * Validate OpenAI API key
	 * @returns {Promise<boolean>}
	 */
	async validateProvider() {
		if (!this.apiKey) {
			return false;
		}

		// Could make a test API call here, but that costs money
		// For now, just check key format
		return this.apiKey.startsWith('sk-');
	}

	/**
	 * Get provider name
	 * @returns {string}
	 */
	getProviderName() {
		return 'openai';
	}

	/**
	 * Get available OpenAI voices
	 * @returns {Object[]} Array of voice options
	 */
	static getAvailableVoices() {
		return [
			{
				id: 'alloy',
				name: 'Alloy',
				description: 'Neutral, balanced voice'
			},
			{
				id: 'echo',
				name: 'Echo',
				description: 'Male, calm and clear'
			},
			{
				id: 'fable',
				name: 'Fable',
				description: 'Male, expressive and dynamic'
			},
			{
				id: 'onyx',
				name: 'Onyx',
				description: 'Male, deep and authoritative'
			},
			{
				id: 'nova',
				name: 'Nova',
				description: 'Female, warm and friendly'
			},
			{
				id: 'shimmer',
				name: 'Shimmer',
				description: 'Female, soft and gentle'
			}
		];
	}
}
