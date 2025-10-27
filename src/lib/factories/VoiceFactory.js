import { OpenAIVoice } from '../strategies/OpenAIVoice.js';
import { ElevenLabsVoice } from '../strategies/ElevenLabsVoice.js';

/**
 * Factory for creating voice provider strategies
 * Handles provider selection based on environment configuration
 */
export class VoiceFactory {
	/**
	 * Detect provider from API key format
	 * @param {string} apiKey - API key to analyze
	 * @returns {string|null} Provider name or null if not detected
	 */
	static detectProvider(apiKey) {
		if (!apiKey) {
			return null;
		}

		// OpenAI keys start with sk- or sk-proj-
		if (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
			return 'openai';
		}

		// ElevenLabs keys are typically 32-character hexadecimal strings
		// They don't have special prefixes and are alphanumeric
		if (/^[a-f0-9]{32}$/i.test(apiKey)) {
			return 'elevenlabs';
		}

		return null;
	}

	/**
	 * Create voice provider from environment config
	 * Supports auto-detection via VOICE_API_KEY or explicit provider selection
	 * @param {string} [providerName] - Override provider (defaults to VOICE_PROVIDER env)
	 * @returns {VoiceStrategy}
	 */
	static createFromEnv(providerName) {
		let provider = providerName;

		// If no provider specified, try auto-detection from VOICE_API_KEY
		if (!provider) {
			const genericKey = process.env.VOICE_API_KEY;
			if (genericKey) {
				const detectedProvider = VoiceFactory.detectProvider(genericKey);
				if (detectedProvider) {
					console.log(
						`[VoiceFactory] Auto-detected provider from VOICE_API_KEY: ${detectedProvider}`
					);
					provider = detectedProvider;
				} else {
					throw new Error(
						`Could not auto-detect voice provider from VOICE_API_KEY format.\n` +
							`Expected formats:\n` +
							`  - OpenAI: Keys starting with 'sk-' or 'sk-proj-'\n` +
							`  - ElevenLabs: 32-character hexadecimal string\n` +
							`\n` +
							`Either provide a valid key or set VOICE_PROVIDER explicitly (openai, elevenlabs)`
					);
				}
			}
		}

		// Fall back to VOICE_PROVIDER env or default
		if (!provider) {
			provider = process.env.VOICE_PROVIDER || 'openai';
		}

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
	 * Checks VOICE_API_KEY first, then falls back to OPENAI_API_KEY
	 * @returns {OpenAIVoice}
	 */
	static createOpenAI() {
		// Priority: VOICE_API_KEY → OPENAI_API_KEY
		let apiKey = process.env.VOICE_API_KEY || process.env.OPENAI_API_KEY || '';

		// If using VOICE_API_KEY, verify it's the right format
		if (process.env.VOICE_API_KEY && !apiKey.startsWith('sk-')) {
			// Check if it's actually an OpenAI key
			const detectedProvider = VoiceFactory.detectProvider(apiKey);
			if (detectedProvider !== 'openai') {
				throw new Error(
					`VOICE_API_KEY format doesn't match OpenAI (expected key starting with 'sk-' or 'sk-proj-').\n` +
						`Detected format: ${detectedProvider || 'unknown'}\n` +
						`Either use OPENAI_API_KEY for provider-specific keys or ensure VOICE_API_KEY is an OpenAI key.`
				);
			}
		}

		if (!apiKey) {
			throw new Error(
				`No API key found for OpenAI voice generation.\n` +
					`Set one of:\n` +
					`  - VOICE_API_KEY (provider-agnostic, auto-detected)\n` +
					`  - OPENAI_API_KEY (provider-specific)\n` +
					`\n` +
					`OpenAI keys start with 'sk-' or 'sk-proj-'`
			);
		}

		return new OpenAIVoice(apiKey);
	}

	/**
	 * Create ElevenLabs voice provider
	 * Checks VOICE_API_KEY first, then falls back to ELEVENLABS_API_KEY
	 * @returns {ElevenLabsVoice}
	 */
	static createElevenLabs() {
		// Priority: VOICE_API_KEY → ELEVENLABS_API_KEY
		let apiKey = process.env.VOICE_API_KEY || process.env.ELEVENLABS_API_KEY || '';

		// If using VOICE_API_KEY, verify it's the right format
		if (process.env.VOICE_API_KEY) {
			const detectedProvider = VoiceFactory.detectProvider(apiKey);
			if (detectedProvider !== 'elevenlabs') {
				throw new Error(
					`VOICE_API_KEY format doesn't match ElevenLabs (expected 32-character hexadecimal string).\n` +
						`Detected format: ${detectedProvider || 'unknown'}\n` +
						`Either use ELEVENLABS_API_KEY for provider-specific keys or ensure VOICE_API_KEY is an ElevenLabs key.`
				);
			}
		}

		if (!apiKey) {
			throw new Error(
				`No API key found for ElevenLabs voice generation.\n` +
					`Set one of:\n` +
					`  - VOICE_API_KEY (provider-agnostic, auto-detected)\n` +
					`  - ELEVENLABS_API_KEY (provider-specific)\n` +
					`\n` +
					`ElevenLabs keys are 32-character hexadecimal strings`
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
	 * Checks both VOICE_API_KEY and provider-specific keys
	 * @param {string} provider - Provider name
	 * @returns {boolean}
	 */
	static isProviderAvailable(provider) {
		// Check if VOICE_API_KEY matches this provider
		const genericKey = process.env.VOICE_API_KEY;
		if (genericKey) {
			const detectedProvider = VoiceFactory.detectProvider(genericKey);
			if (detectedProvider === provider.toLowerCase()) {
				return true;
			}
		}

		// Check provider-specific keys
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
		const genericKey = process.env.VOICE_API_KEY;
		const detectedProvider = genericKey ? VoiceFactory.detectProvider(genericKey) : null;

		return {
			configured: configuredProvider,
			available: VoiceFactory.getAvailableProviders(),
			implemented: VoiceFactory.getImplementedProviders(),
			apiKeys: {
				generic: {
					present: Boolean(genericKey),
					detectedProvider: detectedProvider
				},
				openai: Boolean(process.env.OPENAI_API_KEY),
				elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
				google: Boolean(process.env.GOOGLE_TTS_API_KEY)
			}
		};
	}
}
