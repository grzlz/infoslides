/**
 * @typedef {Object} VideoCodecSettings
 * @property {string} codec - Codec name (e.g., 'libx264', 'libx265', 'vp9')
 * @property {string} preset - Encoding preset: 'ultrafast' | 'fast' | 'medium' | 'slow'
 * @property {number} crf - Constant Rate Factor (0-51, lower = better quality)
 * @property {string} profile - Codec profile (e.g., 'high', 'main', 'baseline')
 * @property {string} pixelFormat - Pixel format (e.g., 'yuv420p')
 */

/**
 * @typedef {Object} AudioCodecSettings
 * @property {string} codec - Audio codec (e.g., 'aac', 'mp3', 'opus')
 * @property {number} bitrate - Audio bitrate in kbps
 * @property {number} sampleRate - Sample rate in Hz (e.g., 44100, 48000)
 * @property {number} channels - Number of audio channels (1=mono, 2=stereo)
 */

/**
 * ExportConfig model for video export settings and FFmpeg parameters
 * Configures output format, quality, compression, and platform-specific optimizations
 */
export class ExportConfig {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Export preset name */
		this.presetName = 'instagram-reels';

		/** @type {string} Output format/container (e.g., 'mp4', 'mov', 'webm') */
		this.format = 'mp4';

		/** @type {Object} Video dimensions */
		this.dimensions = {
			width: 1080,
			height: 1350
		};

		/** @type {number} Frames per second */
		this.fps = 30;

		/** @type {VideoCodecSettings} Video codec settings */
		this.videoCodec = {
			codec: 'libx264',
			preset: 'medium',
			crf: 23,
			profile: 'high',
			pixelFormat: 'yuv420p'
		};

		/** @type {AudioCodecSettings|null} Audio codec settings (null if no audio) */
		this.audioCodec = {
			codec: 'aac',
			bitrate: 128,
			sampleRate: 44100,
			channels: 2
		};

		/** @type {Object} Platform-specific optimizations */
		this.platformOptimization = {
			platform: 'instagram', // instagram, youtube, tiktok, twitter
			maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
			maxDuration: 90000, // 90 seconds in milliseconds
			requiredAspectRatio: '4:5'
		};

		/** @type {Object} Advanced FFmpeg options */
		this.advancedOptions = {
			twoPass: false, // Enable two-pass encoding for better quality
			fastStart: true, // Move moov atom to beginning for web streaming
			colorSpace: 'bt709', // Color space (bt709, bt2020, etc.)
			colorRange: 'tv', // Color range (tv, pc)
			threads: 0 // 0 = auto-detect
		};

		/** @type {string|null} Output file path (null = auto-generate) */
		this.outputPath = null;

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	/**
	 * Generate unique config ID
	 * @returns {string}
	 */
	generateId() {
		return `export-config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {ExportConfig}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Set video codec
	 * @param {string} codec - Codec name
	 * @param {Object} [options={}] - Additional codec options
	 * @returns {ExportConfig}
	 */
	setVideoCodec(codec, options = {}) {
		this.videoCodec.codec = codec;
		Object.assign(this.videoCodec, options);
		this.touch();
		return this;
	}

	/**
	 * Set audio codec
	 * @param {string} codec - Codec name
	 * @param {Object} [options={}] - Additional codec options
	 * @returns {ExportConfig}
	 */
	setAudioCodec(codec, options = {}) {
		if (!this.audioCodec) {
			this.audioCodec = {
				codec,
				bitrate: 128,
				sampleRate: 44100,
				channels: 2
			};
		} else {
			this.audioCodec.codec = codec;
			Object.assign(this.audioCodec, options);
		}
		this.touch();
		return this;
	}

	/**
	 * Disable audio output
	 * @returns {ExportConfig}
	 */
	disableAudio() {
		this.audioCodec = null;
		this.touch();
		return this;
	}

	/**
	 * Set quality preset
	 * @param {string} quality - Quality level: 'low' | 'medium' | 'high' | 'ultra'
	 * @returns {ExportConfig}
	 */
	setQuality(quality) {
		switch (quality) {
			case 'low':
				this.videoCodec.preset = 'veryfast';
				this.videoCodec.crf = 28;
				break;
			case 'medium':
				this.videoCodec.preset = 'medium';
				this.videoCodec.crf = 23;
				break;
			case 'high':
				this.videoCodec.preset = 'slow';
				this.videoCodec.crf = 20;
				break;
			case 'ultra':
				this.videoCodec.preset = 'veryslow';
				this.videoCodec.crf = 18;
				this.advancedOptions.twoPass = true;
				break;
			default:
				throw new Error(`Invalid quality: ${quality}`);
		}
		this.touch();
		return this;
	}

	/**
	 * Optimize for specific platform
	 * @param {string} platform - Platform name: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
	 * @returns {ExportConfig}
	 */
	optimizeForPlatform(platform) {
		this.platformOptimization.platform = platform;

		switch (platform) {
			case 'instagram':
				this.dimensions = { width: 1080, height: 1350 }; // 4:5
				this.fps = 30;
				this.platformOptimization.maxDuration = 90000; // 90s
				this.platformOptimization.maxFileSize = 100 * 1024 * 1024; // 100MB
				this.platformOptimization.requiredAspectRatio = '4:5';
				break;

			case 'youtube':
				this.dimensions = { width: 1920, height: 1080 }; // 16:9
				this.fps = 60;
				this.platformOptimization.maxDuration = 0; // No limit
				this.platformOptimization.maxFileSize = 256 * 1024 * 1024; // 256MB
				this.platformOptimization.requiredAspectRatio = '16:9';
				break;

			case 'tiktok':
				this.dimensions = { width: 1080, height: 1920 }; // 9:16
				this.fps = 30;
				this.platformOptimization.maxDuration = 180000; // 3 minutes
				this.platformOptimization.maxFileSize = 287.6 * 1024 * 1024; // 287.6MB
				this.platformOptimization.requiredAspectRatio = '9:16';
				break;

			case 'twitter':
				this.dimensions = { width: 1280, height: 720 }; // 16:9
				this.fps = 30;
				this.platformOptimization.maxDuration = 140000; // 2:20
				this.platformOptimization.maxFileSize = 512 * 1024 * 1024; // 512MB
				this.platformOptimization.requiredAspectRatio = '16:9';
				break;

			default:
				throw new Error(`Unknown platform: ${platform}`);
		}

		this.touch();
		return this;
	}

	/**
	 * Build FFmpeg command arguments
	 * @returns {string[]} Array of FFmpeg arguments
	 */
	buildFFmpegArgs() {
		const args = [];

		// Video codec
		args.push('-c:v', this.videoCodec.codec);
		args.push('-preset', this.videoCodec.preset);
		args.push('-crf', this.videoCodec.crf.toString());
		args.push('-profile:v', this.videoCodec.profile);
		args.push('-pix_fmt', this.videoCodec.pixelFormat);

		// Video filters (scale, fps)
		const filters = [];
		filters.push(`scale=${this.dimensions.width}:${this.dimensions.height}`);
		filters.push(`fps=${this.fps}`);
		args.push('-vf', filters.join(','));

		// Audio codec
		if (this.audioCodec) {
			args.push('-c:a', this.audioCodec.codec);
			args.push('-b:a', `${this.audioCodec.bitrate}k`);
			args.push('-ar', this.audioCodec.sampleRate.toString());
			args.push('-ac', this.audioCodec.channels.toString());
		} else {
			args.push('-an'); // No audio
		}

		// Advanced options
		if (this.advancedOptions.fastStart) {
			args.push('-movflags', '+faststart');
		}

		if (this.advancedOptions.threads > 0) {
			args.push('-threads', this.advancedOptions.threads.toString());
		}

		args.push('-colorspace', this.advancedOptions.colorSpace);
		args.push('-color_range', this.advancedOptions.colorRange);

		return args;
	}

	/**
	 * Validate export configuration
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (this.dimensions.width <= 0 || this.dimensions.height <= 0) {
			errors.push('Dimensions must be greater than 0');
		}

		if (this.fps <= 0 || this.fps > 120) {
			errors.push('FPS must be between 1 and 120');
		}

		if (this.videoCodec.crf < 0 || this.videoCodec.crf > 51) {
			errors.push('CRF must be between 0 and 51');
		}

		// Platform-specific validation
		if (this.platformOptimization.maxDuration > 0) {
			// Will be validated during export with actual duration
		}

		if (this.videoCodec.crf > 28) {
			warnings.push('High CRF value may result in poor video quality');
		}

		if (this.advancedOptions.twoPass) {
			warnings.push('Two-pass encoding will significantly increase processing time');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone config with new ID
	 * @returns {ExportConfig}
	 */
	clone() {
		const cloned = new ExportConfig();

		cloned.presetName = this.presetName;
		cloned.format = this.format;
		cloned.dimensions = JSON.parse(JSON.stringify(this.dimensions));
		cloned.fps = this.fps;
		cloned.videoCodec = JSON.parse(JSON.stringify(this.videoCodec));
		cloned.audioCodec = this.audioCodec ? JSON.parse(JSON.stringify(this.audioCodec)) : null;
		cloned.platformOptimization = JSON.parse(JSON.stringify(this.platformOptimization));
		cloned.advancedOptions = JSON.parse(JSON.stringify(this.advancedOptions));
		cloned.outputPath = this.outputPath;

		return cloned;
	}

	/**
	 * Serialize config to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			presetName: this.presetName,
			format: this.format,
			dimensions: this.dimensions,
			fps: this.fps,
			videoCodec: this.videoCodec,
			audioCodec: this.audioCodec,
			platformOptimization: this.platformOptimization,
			advancedOptions: this.advancedOptions,
			outputPath: this.outputPath,
			metadata: this.metadata
		};
	}

	/**
	 * Create config from JSON data
	 * @param {Object} data - JSON data
	 * @returns {ExportConfig}
	 */
	static fromJSON(data) {
		const config = new ExportConfig();

		config.id = data.id || config.id;
		config.presetName = data.presetName || 'instagram-reels';
		config.format = data.format || 'mp4';
		config.dimensions = { ...config.dimensions, ...data.dimensions };
		config.fps = data.fps || 30;
		config.videoCodec = { ...config.videoCodec, ...data.videoCodec };
		config.audioCodec = data.audioCodec ? { ...config.audioCodec, ...data.audioCodec } : null;
		config.platformOptimization = {
			...config.platformOptimization,
			...data.platformOptimization
		};
		config.advancedOptions = { ...config.advancedOptions, ...data.advancedOptions };
		config.outputPath = data.outputPath || null;
		config.metadata = { ...config.metadata, ...data.metadata };

		return config;
	}

	/**
	 * Create default Instagram Reels export config
	 * @returns {ExportConfig}
	 */
	static createInstagramReelsPreset() {
		const config = new ExportConfig();
		config.optimizeForPlatform('instagram');
		config.setQuality('high');
		return config;
	}
}
