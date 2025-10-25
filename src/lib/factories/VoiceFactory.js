import { OpenAIVoice } from '../strategies/OpenAIVoice.js';
import { ElevenLabsVoice } from '../strategies/ElevenLabsVoice.js';

/**
 * Factory for creating voice provider strategies
 * Handles provider selection based on environment configuration
 */
export class VoiceFactory {
	/**
	 * Create voice provider from environment config
	 * @param {string} [providerName] - Override provider (defaults to VOICE_PROVIDER env)
	 * @returns {VoiceStrategy}
	 */
	static createFromEnv(providerName) {
		const provider = providerName || process.env.VOICE_PROVIDER || 'openai';

		console.log(`[VoiceFactory] Creating voice provider: ${provider}`);

		switch (provider.toLowerCase()) {
			case 'openai':
				return VoiceFactory.createOpenAI();

			case 'elevenlabs':
				return VoiceFactory.createElevenLabs();

			case 'google':
				throw new Error(
					'Google TTS not implemented yet. Use VOICE_PROVIDER=openai or VOICE_PROVIDER=elevenlabs'
				);

			case 'local':
				throw new Error(
					'Local TTS not implemented yet. Use VOICE_PROVIDER=openai or VOICE_PROVIDER=elevenlabs'
				);

			default:
				throw new Error(
					`Unknown voice provider: ${provider}. Available: openai, elevenlabs, google (todo), local (todo)`
				);
		}
	}

	/**
	 * Create OpenAI voice provider
	 * @returns {OpenAIVoice}
	 */
	static createOpenAI() {
		const apiKey = process.env.OPENAI_API_KEY || '';

		if (!apiKey) {
			throw new Error(
				'OPENAI_API_KEY environment variable is required for OpenAI voice generation'
			);
		}

		return new OpenAIVoice(apiKey);
	}

	/**
	 * Create ElevenLabs voice provider
	 * @returns {ElevenLabsVoice}
	 */
	static createElevenLabs() {
		const apiKey = process.env.ELEVENLABS_API_KEY || '';

		if (!apiKey) {
			throw new Error(
				'ELEVENLABS_API_KEY environment variable is required for ElevenLabs voice generation'
			);
		}

		return new ElevenLabsVoice(apiKey);
	}

	/**
	 * Create voice provider for specific speaker
	 * Allows per-speaker provider overrides
	 * @param {Speaker} speaker - Speaker with voiceProfile
	 * @returns {VoiceStrategy}
	 */
	static createForSpeaker(speaker) {
		// Check if speaker has provider preference
		const speakerProvider = speaker.voiceProfile?.provider;

		if (speakerProvider) {
			console.log(
				`[VoiceFactory] Using speaker-specific provider: ${speakerProvider} for ${speaker.name}`
			);
			return VoiceFactory.createFromEnv(speakerProvider);
		}

		// Use default provider
		return VoiceFactory.createFromEnv();
	}

	/**
	 * Get all available providers
	 * @returns {string[]}
	 */
	static getAvailableProviders() {
		return ['openai', 'elevenlabs', 'google', 'local'];
	}

	/**
	 * Get implemented providers (ready to use)
	 * @returns {string[]}
	 */
	static getImplementedProviders() {
		return ['openai', 'elevenlabs'];
	}

	/**
	 * Check if a provider is available (has API key)
	 * @param {string} provider - Provider name
	 * @returns {boolean}
	 */
	static isProviderAvailable(provider) {
		switch (provider.toLowerCase()) {
			case 'openai':
				return Boolean(process.env.OPENAI_API_KEY);

			case 'elevenlabs':
				return Boolean(process.env.ELEVENLABS_API_KEY);

			case 'google':
				return Boolean(process.env.GOOGLE_TTS_API_KEY);

			default:
				return false;
		}
	}

	/**
	 * Get configured provider from environment
	 * @returns {string}
	 */
	static getConfiguredProvider() {
		return process.env.VOICE_PROVIDER || 'openai';
	}

	/**
	 * Get provider info (name, available, API key status)
	 * @returns {Object}
	 */
	static getProviderInfo() {
		const configuredProvider = VoiceFactory.getConfiguredProvider();

		return {
			configured: configuredProvider,
			available: VoiceFactory.getAvailableProviders(),
			implemented: VoiceFactory.getImplementedProviders(),
			apiKeys: {
				openai: Boolean(process.env.OPENAI_API_KEY),
				elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
				google: Boolean(process.env.GOOGLE_TTS_API_KEY)
			}
		};
	}
}
