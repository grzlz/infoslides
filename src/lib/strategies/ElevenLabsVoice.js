import { VoiceStrategy } from './VoiceStrategy.js';
import fs from 'fs';
import path from 'path';

/**
 * ElevenLabs voice cloning strategy
 * Uses ElevenLabs API for high-quality voice generation and cloning
 *
 * Models:
 * - eleven_monolingual_v1: Fast, good quality
 * - eleven_multilingual_v2: Best quality, supports multiple languages
 * - eleven_turbo_v2: Fastest, lower latency
 *
 * Pricing: ~$30 per 1M characters (as of 2024)
 */
export class ElevenLabsVoice extends VoiceStrategy {
	constructor(apiKey) {
		super(apiKey);
		this.apiUrl = 'https://api.elevenlabs.io/v1';
	}

	/**
	 * Generate speech using ElevenLabs
	 * @param {string} text - Text to speak
	 * @param {Object} voiceProfile - Voice configuration
	 * @returns {Promise<Object>} { audioPath, duration, format, provider }
	 */
	async generateSpeech(text, voiceProfile) {
		if (!this.apiKey) {
			throw new Error('ElevenLabs API key is required for voice generation');
		}

		// Default voice ID (Rachel - calm, clear female voice)
		const voiceId = voiceProfile.voiceId || '21m00Tcm4TlvDq8ikWAM';
		const model = voiceProfile.model || 'eleven_monolingual_v1';

		// Voice settings for fine-tuning
		const voiceSettings = {
			stability: voiceProfile.stability ?? 0.5,
			similarity_boost: voiceProfile.similarity ?? 0.75,
			style: voiceProfile.style ?? 0.0,
			use_speaker_boost: true
		};

		const response = await fetch(`${this.apiUrl}/text-to-speech/${voiceId}`, {
			method: 'POST',
			headers: {
				'xi-api-key': this.apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text,
				model_id: model,
				voice_settings: voiceSettings
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
		}

		// Create output directory
		const outputDir = path.join(process.cwd(), 'output', 'audio');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 9);
		const filename = `elevenlabs-${voiceId}-${timestamp}-${random}.mp3`;
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
				voiceId,
				model,
				voiceSettings,
				textLength: text.length,
				generatedAt: new Date().toISOString()
			}
		};
	}

	/**
	 * Validate ElevenLabs API key
	 * @returns {Promise<boolean>}
	 */
	async validateProvider() {
		if (!this.apiKey) {
			return false;
		}

		try {
			// Test API key by fetching user info
			const response = await fetch(`${this.apiUrl}/user`, {
				headers: {
					'xi-api-key': this.apiKey
				}
			});

			return response.ok;
		} catch (error) {
			console.error('[ElevenLabsVoice] Validation failed:', error);
			return false;
		}
	}

	/**
	 * Get provider name
	 * @returns {string}
	 */
	getProviderName() {
		return 'elevenlabs';
	}

	/**
	 * Fetch available voices from ElevenLabs account
	 * @returns {Promise<Object[]>} Array of voice options
	 */
	async getAvailableVoices() {
		if (!this.apiKey) {
			throw new Error('API key required to fetch voices');
		}

		const response = await fetch(`${this.apiUrl}/voices`, {
			headers: {
				'xi-api-key': this.apiKey
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch voices: ${response.statusText}`);
		}

		const data = await response.json();
		return data.voices.map((voice) => ({
			id: voice.voice_id,
			name: voice.name,
			description: voice.description || '',
			category: voice.category,
			labels: voice.labels
		}));
	}

	/**
	 * Get popular pre-made voices (no API key needed)
	 * @returns {Object[]} Array of popular voice options
	 */
	static getPopularVoices() {
		return [
			{
				id: '21m00Tcm4TlvDq8ikWAM',
				name: 'Rachel',
				description: 'Calm, clear female voice'
			},
			{
				id: 'EXAVITQu4vr4xnSDxMaL',
				name: 'Bella',
				description: 'Soft, warm female voice'
			},
			{
				id: 'ErXwobaYiN019PkySvjV',
				name: 'Antoni',
				description: 'Well-rounded male voice'
			},
			{
				id: 'VR6AewLTigWG4xSOukaG',
				name: 'Arnold',
				description: 'Crisp, authoritative male voice'
			},
			{
				id: 'pNInz6obpgDQGcFmaJgB',
				name: 'Adam',
				description: 'Deep, resonant male voice'
			},
			{
				id: 'yoZ06aMxZJJ28mfd3POQ',
				name: 'Sam',
				description: 'Dynamic, raspy male voice'
			}
		];
	}
}
