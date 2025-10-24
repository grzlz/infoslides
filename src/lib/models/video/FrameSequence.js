/**
 * @typedef {Object} Frame
 * @property {number} number - Frame number (0-indexed)
 * @property {number} timestamp - Timestamp in milliseconds
 * @property {string} imagePath - Path to rendered frame image
 * @property {number} size - File size in bytes
 */

/**
 * FrameSequence model representing a sequence of rendered video frames
 * Used for frame-by-frame rendering and FFmpeg video assembly
 */
export class FrameSequence {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {Frame[]} Array of rendered frames */
		this.frames = [];

		/** @type {number} Frames per second */
		this.fps = 30;

		/** @type {number} Total duration in milliseconds */
		this.duration = 0;

		/** @type {Object} Frame dimensions */
		this.dimensions = {
			width: 1080,
			height: 1350
		};

		/** @type {string} Directory where frames are stored */
		this.outputDirectory = '';

		/** @type {string} Frame filename pattern (e.g., 'frame-%04d.png') */
		this.filenamePattern = 'frame-%04d.png';

		/** @type {Object} Rendering status */
		this.status = {
			totalFrames: 0,
			renderedFrames: 0,
			failedFrames: 0,
			isComplete: false,
			startedAt: null,
			completedAt: null
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			totalFileSize: 0 // Total size of all frames in bytes
		};
	}

	/**
	 * Generate unique frame sequence ID
	 * @returns {string}
	 */
	generateId() {
		return `frames-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {FrameSequence}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Calculate total number of frames needed
	 * @param {number} durationMs - Duration in milliseconds
	 * @returns {number}
	 */
	calculateTotalFrames(durationMs) {
		this.duration = durationMs;
		this.status.totalFrames = Math.ceil((durationMs / 1000) * this.fps);
		this.touch();
		return this.status.totalFrames;
	}

	/**
	 * Start frame rendering process
	 * @returns {FrameSequence}
	 */
	startRendering() {
		this.status.startedAt = new Date().toISOString();
		this.status.renderedFrames = 0;
		this.status.failedFrames = 0;
		this.status.isComplete = false;
		this.touch();
		return this;
	}

	/**
	 * Add a rendered frame
	 * @param {number} frameNumber - Frame number (0-indexed)
	 * @param {string} imagePath - Path to frame image
	 * @param {number} [fileSize=0] - File size in bytes
	 * @returns {FrameSequence}
	 */
	addFrame(frameNumber, imagePath, fileSize = 0) {
		const timestamp = (frameNumber / this.fps) * 1000;

		this.frames.push({
			number: frameNumber,
			timestamp,
			imagePath,
			size: fileSize
		});

		this.status.renderedFrames++;
		this.metadata.totalFileSize += fileSize;

		// Sort frames by number
		this.frames.sort((a, b) => a.number - b.number);

		this.touch();
		return this;
	}

	/**
	 * Record a failed frame
	 * @returns {FrameSequence}
	 */
	recordFailedFrame() {
		this.status.failedFrames++;
		this.touch();
		return this;
	}

	/**
	 * Mark rendering as complete
	 * @returns {FrameSequence}
	 */
	completeRendering() {
		this.status.isComplete = true;
		this.status.completedAt = new Date().toISOString();
		this.touch();
		return this;
	}

	/**
	 * Get rendering progress percentage
	 * @returns {number} Progress from 0-100
	 */
	getProgress() {
		if (this.status.totalFrames === 0) return 0;
		return Math.round((this.status.renderedFrames / this.status.totalFrames) * 100);
	}

	/**
	 * Get estimated time remaining
	 * @returns {number|null} Estimated seconds remaining, or null if cannot calculate
	 */
	getEstimatedTimeRemaining() {
		if (!this.status.startedAt || this.status.renderedFrames === 0) return null;

		const elapsed = Date.now() - new Date(this.status.startedAt).getTime();
		const avgTimePerFrame = elapsed / this.status.renderedFrames;
		const remainingFrames = this.status.totalFrames - this.status.renderedFrames;

		return Math.ceil((remainingFrames * avgTimePerFrame) / 1000);
	}

	/**
	 * Get frame at specific timestamp
	 * @param {number} timestampMs - Timestamp in milliseconds
	 * @returns {Frame|null}
	 */
	getFrameAtTimestamp(timestampMs) {
		return (
			this.frames.find((f) => Math.abs(f.timestamp - timestampMs) < 1000 / this.fps / 2) || null
		);
	}

	/**
	 * Validate frame sequence
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (this.fps <= 0 || this.fps > 120) {
			errors.push('FPS must be between 1 and 120');
		}

		if (this.duration <= 0) {
			errors.push('Duration must be greater than 0');
		}

		if (!this.outputDirectory || this.outputDirectory.trim() === '') {
			errors.push('Output directory is required');
		}

		if (this.status.totalFrames > 0 && this.frames.length < this.status.totalFrames) {
			warnings.push(
				`Only ${this.frames.length} of ${this.status.totalFrames} frames rendered (${this.getProgress()}%)`
			);
		}

		if (this.status.failedFrames > 0) {
			warnings.push(`${this.status.failedFrames} frames failed to render`);
		}

		// Check for missing frames in sequence
		const frameNumbers = this.frames.map((f) => f.number).sort((a, b) => a - b);
		for (let i = 1; i < frameNumbers.length; i++) {
			if (frameNumbers[i] !== frameNumbers[i - 1] + 1) {
				warnings.push(
					`Missing frames detected: gap between frame ${frameNumbers[i - 1]} and ${frameNumbers[i]}`
				);
				break;
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone frame sequence with new ID
	 * @returns {FrameSequence}
	 */
	clone() {
		const cloned = new FrameSequence();

		cloned.fps = this.fps;
		cloned.duration = this.duration;
		cloned.dimensions = JSON.parse(JSON.stringify(this.dimensions));
		cloned.outputDirectory = this.outputDirectory;
		cloned.filenamePattern = this.filenamePattern;
		// Don't clone frames or status - new sequence starts fresh

		return cloned;
	}

	/**
	 * Serialize frame sequence to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			frames: this.frames,
			fps: this.fps,
			duration: this.duration,
			dimensions: this.dimensions,
			outputDirectory: this.outputDirectory,
			filenamePattern: this.filenamePattern,
			status: this.status,
			metadata: this.metadata
		};
	}

	/**
	 * Create frame sequence from JSON data
	 * @param {Object} data - JSON data
	 * @returns {FrameSequence}
	 */
	static fromJSON(data) {
		const frameSeq = new FrameSequence();

		frameSeq.id = data.id || frameSeq.id;
		frameSeq.frames = data.frames || [];
		frameSeq.fps = data.fps || 30;
		frameSeq.duration = data.duration || 0;
		frameSeq.dimensions = { ...frameSeq.dimensions, ...data.dimensions };
		frameSeq.outputDirectory = data.outputDirectory || '';
		frameSeq.filenamePattern = data.filenamePattern || 'frame-%04d.png';
		frameSeq.status = { ...frameSeq.status, ...data.status };
		frameSeq.metadata = { ...frameSeq.metadata, ...data.metadata };

		return frameSeq;
	}
}
