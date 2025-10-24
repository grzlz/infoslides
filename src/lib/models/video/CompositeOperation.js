/**
 * @typedef {Object} OverlayLayer
 * @property {string} id - Layer ID
 * @property {string} type - Layer type: 'image' | 'text' | 'video' | 'html'
 * @property {string} content - Content reference (file path, text, HTML)
 * @property {Object} position - {x, y, width, height} in pixels or percentages
 * @property {number} startTime - When layer appears (ms)
 * @property {number} endTime - When layer disappears (ms)
 * @property {number} opacity - Opacity (0-1)
 * @property {number} zIndex - Stacking order
 */

/**
 * @typedef {Object} TransitionEffect
 * @property {string} type - Transition type: 'fade' | 'slide' | 'wipe' | 'dissolve'
 * @property {number} duration - Transition duration in ms
 * @property {string} easing - Easing function: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
 */

/**
 * CompositeOperation model representing a video compositing operation
 * Manages layering of background video, dialogue overlays, and effects using FFmpeg
 */
export class CompositeOperation {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} ID of the background video clip */
		this.backgroundClipId = '';

		/** @type {OverlayLayer[]} Array of overlay layers (dialogue, code, etc.) */
		this.overlays = [];

		/** @type {Object} Background video settings */
		this.backgroundSettings = {
			blur: 0, // Blur amount (0 = none)
			brightness: 1.0, // Brightness multiplier (1.0 = normal)
			saturation: 1.0, // Saturation multiplier (1.0 = normal)
			scale: 1.0 // Scale multiplier (1.0 = original size)
		};

		/** @type {TransitionEffect[]} Transitions between overlays */
		this.transitions = [];

		/** @type {Object} Audio mixing settings */
		this.audio = {
			backgroundVolume: 0.3, // Background video audio (0-1)
			voiceoverVolume: 1.0, // Voiceover audio (0-1)
			musicVolume: 0.2, // Background music (0-1)
			voiceoverPath: null, // Path to voiceover file
			musicPath: null // Path to background music file
		};

		/** @type {Object} Output settings */
		this.output = {
			width: 1080,
			height: 1350,
			fps: 30,
			codec: 'libx264',
			pixelFormat: 'yuv420p'
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			estimatedProcessingTime: 0 // Estimated FFmpeg processing time in seconds
		};
	}

	/**
	 * Generate unique operation ID
	 * @returns {string}
	 */
	generateId() {
		return `composite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {CompositeOperation}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Add an overlay layer
	 * @param {OverlayLayer} overlay - Overlay configuration
	 * @returns {CompositeOperation}
	 */
	addOverlay(overlay) {
		this.overlays.push({
			id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
			...overlay
		});
		this.sortOverlays();
		this.touch();
		return this;
	}

	/**
	 * Sort overlays by zIndex and startTime
	 * @returns {CompositeOperation}
	 */
	sortOverlays() {
		this.overlays.sort((a, b) => {
			if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
			return a.startTime - b.startTime;
		});
		return this;
	}

	/**
	 * Remove an overlay by ID
	 * @param {string} overlayId - Overlay ID
	 * @returns {CompositeOperation}
	 */
	removeOverlay(overlayId) {
		this.overlays = this.overlays.filter((o) => o.id !== overlayId);
		this.touch();
		return this;
	}

	/**
	 * Set background clip ID
	 * @param {string} clipId - Video clip ID
	 * @returns {CompositeOperation}
	 */
	setBackgroundClip(clipId) {
		this.backgroundClipId = clipId;
		this.touch();
		return this;
	}

	/**
	 * Apply blur to background video
	 * @param {number} amount - Blur amount (0-10)
	 * @returns {CompositeOperation}
	 */
	setBackgroundBlur(amount) {
		this.backgroundSettings.blur = Math.max(0, Math.min(10, amount));
		this.touch();
		return this;
	}

	/**
	 * Set voiceover audio
	 * @param {string} filePath - Path to voiceover file
	 * @param {number} [volume=1.0] - Volume (0-1)
	 * @returns {CompositeOperation}
	 */
	setVoiceover(filePath, volume = 1.0) {
		this.audio.voiceoverPath = filePath;
		this.audio.voiceoverVolume = Math.max(0, Math.min(1, volume));
		this.touch();
		return this;
	}

	/**
	 * Set background music
	 * @param {string} filePath - Path to music file
	 * @param {number} [volume=0.2] - Volume (0-1)
	 * @returns {CompositeOperation}
	 */
	setBackgroundMusic(filePath, volume = 0.2) {
		this.audio.musicPath = filePath;
		this.audio.musicVolume = Math.max(0, Math.min(1, volume));
		this.touch();
		return this;
	}

	/**
	 * Add transition between overlays
	 * @param {string} type - Transition type
	 * @param {number} duration - Duration in ms
	 * @param {string} [easing='ease-in-out'] - Easing function
	 * @returns {CompositeOperation}
	 */
	addTransition(type, duration, easing = 'ease-in-out') {
		this.transitions.push({
			type,
			duration,
			easing
		});
		this.touch();
		return this;
	}

	/**
	 * Estimate FFmpeg processing time
	 * @param {number} videoDurationMs - Video duration in milliseconds
	 * @returns {number} Estimated processing time in seconds
	 */
	estimateProcessingTime(videoDurationMs) {
		const durationSec = videoDurationMs / 1000;
		let processingTime = durationSec * 0.5; // Base: 0.5x real-time

		// Additional time for overlays
		processingTime += this.overlays.length * 2;

		// Additional time for effects
		if (this.backgroundSettings.blur > 0) processingTime += 5;
		if (this.transitions.length > 0) processingTime += this.transitions.length * 1;

		// Additional time for audio mixing
		if (this.audio.voiceoverPath) processingTime += 2;
		if (this.audio.musicPath) processingTime += 2;

		this.metadata.estimatedProcessingTime = Math.ceil(processingTime);
		return this.metadata.estimatedProcessingTime;
	}

	/**
	 * Validate composite operation
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (!this.backgroundClipId) {
			errors.push('Background clip ID is required');
		}

		if (this.overlays.length === 0) {
			warnings.push('No overlays defined - output will be just the background video');
		}

		// Validate overlays
		this.overlays.forEach((overlay, index) => {
			if (!overlay.type) {
				errors.push(`Overlay ${index + 1}: type is required`);
			}

			if (!overlay.content) {
				errors.push(`Overlay ${index + 1}: content is required`);
			}

			if (overlay.startTime < 0) {
				errors.push(`Overlay ${index + 1}: startTime must be >= 0`);
			}

			if (overlay.endTime <= overlay.startTime) {
				errors.push(`Overlay ${index + 1}: endTime must be greater than startTime`);
			}

			if (overlay.opacity < 0 || overlay.opacity > 1) {
				errors.push(`Overlay ${index + 1}: opacity must be between 0 and 1`);
			}
		});

		// Validate output dimensions
		if (this.output.width <= 0 || this.output.height <= 0) {
			errors.push('Output dimensions must be greater than 0');
		}

		if (this.output.fps <= 0 || this.output.fps > 120) {
			errors.push('Output FPS must be between 1 and 120');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone operation with new ID
	 * @returns {CompositeOperation}
	 */
	clone() {
		const cloned = new CompositeOperation();

		cloned.backgroundClipId = this.backgroundClipId;
		cloned.overlays = JSON.parse(JSON.stringify(this.overlays));
		cloned.backgroundSettings = JSON.parse(JSON.stringify(this.backgroundSettings));
		cloned.transitions = JSON.parse(JSON.stringify(this.transitions));
		cloned.audio = JSON.parse(JSON.stringify(this.audio));
		cloned.output = JSON.parse(JSON.stringify(this.output));

		return cloned;
	}

	/**
	 * Serialize operation to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			backgroundClipId: this.backgroundClipId,
			overlays: this.overlays,
			backgroundSettings: this.backgroundSettings,
			transitions: this.transitions,
			audio: this.audio,
			output: this.output,
			metadata: this.metadata
		};
	}

	/**
	 * Create operation from JSON data
	 * @param {Object} data - JSON data
	 * @returns {CompositeOperation}
	 */
	static fromJSON(data) {
		const operation = new CompositeOperation();

		operation.id = data.id || operation.id;
		operation.backgroundClipId = data.backgroundClipId || '';
		operation.overlays = data.overlays || [];
		operation.backgroundSettings = {
			...operation.backgroundSettings,
			...data.backgroundSettings
		};
		operation.transitions = data.transitions || [];
		operation.audio = { ...operation.audio, ...data.audio };
		operation.output = { ...operation.output, ...data.output };
		operation.metadata = { ...operation.metadata, ...data.metadata };

		operation.sortOverlays();

		return operation;
	}
}
