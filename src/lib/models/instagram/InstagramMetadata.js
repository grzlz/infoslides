/**
 * @typedef {Object} VideoSpecs
 * @property {number} width - Video width in pixels
 * @property {number} height - Video height in pixels
 * @property {number} fps - Frames per second
 * @property {number} bitrate - Video bitrate in kbps
 * @property {string} codec - Video codec (e.g., 'h264')
 * @property {number} duration - Duration in milliseconds
 */

/**
 * @typedef {Object} AudioSpecs
 * @property {number} sampleRate - Audio sample rate in Hz
 * @property {number} bitrate - Audio bitrate in kbps
 * @property {number} channels - Number of audio channels (1=mono, 2=stereo)
 */

/**
 * Instagram Metadata model for Reels-specific requirements and constraints
 * Ensures content meets Instagram's technical and policy requirements
 */
export class InstagramMetadata {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {VideoSpecs} Video specifications */
		this.videoSpecs = {
			width: 1080,
			height: 1350, // 4:5 aspect ratio (optimal for Reels)
			fps: 30,
			bitrate: 5000, // kbps
			codec: 'h264',
			duration: 0
		};

		/** @type {AudioSpecs|null} Audio specifications (null if no audio) */
		this.audioSpecs = null;

		/** @type {string} Aspect ratio: '1:1' | '4:5' | '9:16' */
		this.aspectRatio = '4:5';

		/** @type {string|null} Cover/thumbnail image URL */
		this.coverImageUrl = null;

		/** @type {string[]} Content warnings/labels */
		this.contentWarnings = [];

		/** @type {Object} Instagram-specific features */
		this.features = {
			allowComments: true,
			allowSharing: true,
			allowSaving: true,
			allowRemix: false // Remix/Reels reuse feature
		};

		/** @type {Object} Accessibility */
		this.accessibility = {
			hasSubtitles: false,
			hasCaptions: false,
			hasAudioDescription: false,
			altText: ''
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	/**
	 * Generate unique metadata ID
	 * @returns {string}
	 */
	generateId() {
		return `instagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {InstagramMetadata}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Set video dimensions based on aspect ratio preset
	 * @param {string} aspectRatio - '1:1' | '4:5' | '9:16'
	 * @returns {InstagramMetadata}
	 */
	setAspectRatio(aspectRatio) {
		this.aspectRatio = aspectRatio;

		// Set dimensions based on aspect ratio
		switch (aspectRatio) {
			case '1:1': // Square
				this.videoSpecs.width = 1080;
				this.videoSpecs.height = 1080;
				break;
			case '4:5': // Portrait (recommended for Reels)
				this.videoSpecs.width = 1080;
				this.videoSpecs.height = 1350;
				break;
			case '9:16': // Full vertical (Stories format)
				this.videoSpecs.width = 1080;
				this.videoSpecs.height = 1920;
				break;
			default:
				throw new Error(`Invalid aspect ratio: ${aspectRatio}`);
		}

		this.touch();
		return this;
	}

	/**
	 * Set video duration
	 * @param {number} durationMs - Duration in milliseconds
	 * @returns {InstagramMetadata}
	 */
	setDuration(durationMs) {
		this.videoSpecs.duration = durationMs;
		this.touch();
		return this;
	}

	/**
	 * Enable audio and set specifications
	 * @param {number} [sampleRate=44100] - Sample rate in Hz
	 * @param {number} [bitrate=128] - Bitrate in kbps
	 * @param {number} [channels=2] - Number of channels
	 * @returns {InstagramMetadata}
	 */
	enableAudio(sampleRate = 44100, bitrate = 128, channels = 2) {
		this.audioSpecs = {
			sampleRate,
			bitrate,
			channels
		};
		this.touch();
		return this;
	}

	/**
	 * Disable audio
	 * @returns {InstagramMetadata}
	 */
	disableAudio() {
		this.audioSpecs = null;
		this.touch();
		return this;
	}

	/**
	 * Add content warning
	 * @param {string} warning - Warning text
	 * @returns {InstagramMetadata}
	 */
	addContentWarning(warning) {
		if (!this.contentWarnings.includes(warning)) {
			this.contentWarnings.push(warning);
			this.touch();
		}
		return this;
	}

	/**
	 * Enable subtitles/captions for accessibility
	 * @param {string} [altText=''] - Alt text description
	 * @returns {InstagramMetadata}
	 */
	enableAccessibility(altText = '') {
		this.accessibility.hasSubtitles = true;
		this.accessibility.hasCaptions = true;
		this.accessibility.altText = altText;
		this.touch();
		return this;
	}

	/**
	 * Validate Instagram requirements
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		// Validate aspect ratio
		if (!['1:1', '4:5', '9:16'].includes(this.aspectRatio)) {
			errors.push(`Invalid aspect ratio: ${this.aspectRatio}. Must be 1:1, 4:5, or 9:16`);
		}

		// Validate video dimensions
		if (this.videoSpecs.width < 500 || this.videoSpecs.width > 1920) {
			errors.push(`Video width (${this.videoSpecs.width}px) must be between 500-1920px`);
		}

		if (this.videoSpecs.height < 500 || this.videoSpecs.height > 1920) {
			errors.push(`Video height (${this.videoSpecs.height}px) must be between 500-1920px`);
		}

		// Validate FPS
		if (![23, 24, 25, 29.97, 30, 50, 59.94, 60].includes(this.videoSpecs.fps)) {
			warnings.push(
				`FPS (${this.videoSpecs.fps}) may not be optimal. Instagram recommends 23-30 fps for Reels`
			);
		}

		// Validate duration (Instagram Reels: 3s - 90s)
		const durationSeconds = this.videoSpecs.duration / 1000;
		if (durationSeconds < 3) {
			errors.push(`Video duration (${durationSeconds.toFixed(1)}s) must be at least 3 seconds`);
		}

		if (durationSeconds > 90) {
			errors.push(`Video duration (${durationSeconds.toFixed(1)}s) exceeds 90 second limit for Reels`);
		}

		// Validate bitrate
		if (this.videoSpecs.bitrate < 1000) {
			warnings.push(`Video bitrate (${this.videoSpecs.bitrate}kbps) may result in poor quality`);
		}

		if (this.videoSpecs.bitrate > 10000) {
			warnings.push(
				`Video bitrate (${this.videoSpecs.bitrate}kbps) is very high and may cause upload issues`
			);
		}

		// Validate codec
		if (this.videoSpecs.codec !== 'h264') {
			warnings.push(
				`Video codec (${this.videoSpecs.codec}) is not h264. Instagram recommends h264 for best compatibility`
			);
		}

		// Validate audio specs if present
		if (this.audioSpecs) {
			if (this.audioSpecs.sampleRate < 44100) {
				warnings.push(
					`Audio sample rate (${this.audioSpecs.sampleRate}Hz) is below recommended 44100Hz`
				);
			}

			if (this.audioSpecs.bitrate < 64) {
				warnings.push(`Audio bitrate (${this.audioSpecs.bitrate}kbps) may result in poor audio quality`);
			}
		}

		// Accessibility warnings
		if (!this.accessibility.hasSubtitles && !this.accessibility.hasCaptions) {
			warnings.push('Consider adding subtitles/captions for accessibility');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone metadata with new ID
	 * @returns {InstagramMetadata}
	 */
	clone() {
		const cloned = new InstagramMetadata();

		cloned.videoSpecs = JSON.parse(JSON.stringify(this.videoSpecs));
		cloned.audioSpecs = this.audioSpecs ? JSON.parse(JSON.stringify(this.audioSpecs)) : null;
		cloned.aspectRatio = this.aspectRatio;
		cloned.coverImageUrl = this.coverImageUrl;
		cloned.contentWarnings = [...this.contentWarnings];
		cloned.features = JSON.parse(JSON.stringify(this.features));
		cloned.accessibility = JSON.parse(JSON.stringify(this.accessibility));

		return cloned;
	}

	/**
	 * Serialize metadata to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			videoSpecs: this.videoSpecs,
			audioSpecs: this.audioSpecs,
			aspectRatio: this.aspectRatio,
			coverImageUrl: this.coverImageUrl,
			contentWarnings: this.contentWarnings,
			features: this.features,
			accessibility: this.accessibility,
			metadata: this.metadata
		};
	}

	/**
	 * Create metadata from JSON data
	 * @param {Object} data - JSON data
	 * @returns {InstagramMetadata}
	 */
	static fromJSON(data) {
		const instagramMeta = new InstagramMetadata();

		instagramMeta.id = data.id || instagramMeta.id;
		instagramMeta.videoSpecs = { ...instagramMeta.videoSpecs, ...data.videoSpecs };
		instagramMeta.audioSpecs = data.audioSpecs || null;
		instagramMeta.aspectRatio = data.aspectRatio || '4:5';
		instagramMeta.coverImageUrl = data.coverImageUrl || null;
		instagramMeta.contentWarnings = data.contentWarnings || [];
		instagramMeta.features = { ...instagramMeta.features, ...data.features };
		instagramMeta.accessibility = { ...instagramMeta.accessibility, ...data.accessibility };
		instagramMeta.metadata = { ...instagramMeta.metadata, ...data.metadata };

		return instagramMeta;
	}

	/**
	 * Create default Reels metadata (4:5 aspect ratio, 30s duration)
	 * @returns {InstagramMetadata}
	 */
	static createDefaultReels() {
		const metadata = new InstagramMetadata();
		metadata.setAspectRatio('4:5');
		metadata.setDuration(30000); // 30 seconds
		metadata.enableAudio();
		return metadata;
	}
}
