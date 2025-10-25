/**
 * Base class for voice generation strategies
 * Each provider (OpenAI, ElevenLabs, Google, etc.) implements this interface
 */
export class VoiceStrategy {
	/**
	 * @param {string} apiKey - API key for the voice provider
	 */
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	/**
	 * Generate speech audio from text
	 * @param {string} text - Text to convert to speech
	 * @param {Object} voiceProfile - Voice configuration
	 * @param {string} voiceProfile.voiceId - Voice identifier for this provider
	 * @param {string} [voiceProfile.model] - Model identifier (provider-specific)
	 * @param {number} [voiceProfile.stability] - Voice stability (0-1, ElevenLabs)
	 * @param {number} [voiceProfile.similarity] - Similarity boost (0-1, ElevenLabs)
	 * @param {number} [voiceProfile.style] - Style exaggeration (0-1, ElevenLabs)
	 * @param {number} [voiceProfile.speed] - Speech speed multiplier (0.25-4.0, OpenAI)
	 * @returns {Promise<Object>} { audioPath, duration, format, provider }
	 */
	async generateSpeech(text, voiceProfile) {
		throw new Error('generateSpeech() must be implemented by provider strategy');
	}

	/**
	 * Validate API key and provider availability
	 * @returns {Promise<boolean>}
	 */
	async validateProvider() {
		if (!this.apiKey) {
			return false;
		}
		return true;
	}

	/**
	 * Get provider name
	 * @returns {string}
	 */
	getProviderName() {
		return 'base';
	}

	/**
	 * Estimate audio duration based on text length
	 * Default implementation: ~150 words per minute
	 * @param {string} text - Text to estimate
	 * @returns {number} Duration in milliseconds
	 */
	estimateDuration(text) {
		const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
		const wordsPerMinute = 150;
		const durationSeconds = (wordCount / wordsPerMinute) * 60;
		return Math.round(durationSeconds * 1000);
	}

	/**
	 * Get provider-specific error message
	 * @param {Error} error - Original error
	 * @returns {string} User-friendly error message
	 */
	formatError(error) {
		return `${this.getProviderName()} TTS error: ${error.message}`;
	}
}
