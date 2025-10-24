/**
 * @typedef {Object} VideoProperties
 * @property {number} width - Video width in pixels
 * @property {number} height - Video height in pixels
 * @property {number} fps - Frames per second
 * @property {number} duration - Duration in milliseconds
 * @property {string} codec - Video codec used
 * @property {number} bitrate - Video bitrate in kbps
 * @property {number} fileSize - File size in bytes
 */

/**
 * @typedef {Object} ExportStatus
 * @property {string} phase - Export phase: 'queued' | 'rendering' | 'encoding' | 'complete' | 'failed'
 * @property {number} progress - Progress percentage (0-100)
 * @property {string|null} error - Error message if failed
 * @property {number} processingTime - Total processing time in seconds
 */

/**
 * ExportedVideo model representing a finalized, exported video file
 * Contains metadata about the export process, file properties, and publishing status
 */
export class ExportedVideo {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Output file path */
		this.filePath = '';

		/** @type {string|null} Thumbnail/cover image path */
		this.thumbnailPath = null;

		/** @type {VideoProperties} Video technical properties */
		this.properties = {
			width: 0,
			height: 0,
			fps: 0,
			duration: 0,
			codec: '',
			bitrate: 0,
			fileSize: 0
		};

		/** @type {ExportStatus} Export status and progress */
		this.exportStatus = {
			phase: 'queued',
			progress: 0,
			error: null,
			processingTime: 0
		};

		/** @type {Object} Source references */
		this.sources = {
			dialogueId: null, // ID of DialogueContent
			topicId: null, // ID of Topic
			backgroundClipId: null, // ID of VideoClip
			compositeOperationId: null // ID of CompositeOperation
		};

		/** @type {Object} Instagram-specific metadata */
		this.instagram = {
			captionId: null, // ID of Caption
			metadataId: null, // ID of InstagramMetadata
			published: false,
			publishedAt: null,
			postUrl: null,
			engagement: {
				views: 0,
				likes: 0,
				comments: 0,
				shares: 0,
				saves: 0
			}
		};

		/** @type {Object} Quality checks */
		this.quality = {
			passedValidation: false,
			validationErrors: [],
			warnings: [],
			visualQuality: null, // Will be set after analysis
			audioQuality: null
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			exportedAt: null,
			exportConfigId: null
		};
	}

	/**
	 * Generate unique video ID
	 * @returns {string}
	 */
	generateId() {
		return `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {ExportedVideo}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Set export phase
	 * @param {string} phase - Export phase
	 * @param {number} [progress=0] - Progress percentage
	 * @returns {ExportedVideo}
	 */
	setPhase(phase, progress = 0) {
		this.exportStatus.phase = phase;
		this.exportStatus.progress = Math.max(0, Math.min(100, progress));
		this.touch();
		return this;
	}

	/**
	 * Update export progress
	 * @param {number} progress - Progress percentage (0-100)
	 * @returns {ExportedVideo}
	 */
	updateProgress(progress) {
		this.exportStatus.progress = Math.max(0, Math.min(100, progress));
		this.touch();
		return this;
	}

	/**
	 * Mark export as complete
	 * @param {string} filePath - Path to exported file
	 * @param {number} processingTime - Processing time in seconds
	 * @returns {ExportedVideo}
	 */
	markComplete(filePath, processingTime) {
		this.filePath = filePath;
		this.exportStatus.phase = 'complete';
		this.exportStatus.progress = 100;
		this.exportStatus.processingTime = processingTime;
		this.metadata.exportedAt = new Date().toISOString();
		this.touch();
		return this;
	}

	/**
	 * Mark export as failed
	 * @param {string} error - Error message
	 * @returns {ExportedVideo}
	 */
	markFailed(error) {
		this.exportStatus.phase = 'failed';
		this.exportStatus.error = error;
		this.touch();
		return this;
	}

	/**
	 * Set video properties from analysis
	 * @param {Object} props - Video properties
	 * @returns {ExportedVideo}
	 */
	setProperties(props) {
		Object.assign(this.properties, props);
		this.touch();
		return this;
	}

	/**
	 * Add validation error
	 * @param {string} error - Error message
	 * @returns {ExportedVideo}
	 */
	addValidationError(error) {
		this.quality.validationErrors.push(error);
		this.quality.passedValidation = false;
		this.touch();
		return this;
	}

	/**
	 * Add validation warning
	 * @param {string} warning - Warning message
	 * @returns {ExportedVideo}
	 */
	addValidationWarning(warning) {
		this.quality.warnings.push(warning);
		this.touch();
		return this;
	}

	/**
	 * Mark validation as passed
	 * @returns {ExportedVideo}
	 */
	markValidationPassed() {
		this.quality.passedValidation = true;
		this.touch();
		return this;
	}

	/**
	 * Mark as published to Instagram
	 * @param {string} postUrl - Instagram post URL
	 * @returns {ExportedVideo}
	 */
	markPublished(postUrl) {
		this.instagram.published = true;
		this.instagram.publishedAt = new Date().toISOString();
		this.instagram.postUrl = postUrl;
		this.touch();
		return this;
	}

	/**
	 * Update Instagram engagement metrics
	 * @param {Object} metrics - Engagement metrics
	 * @returns {ExportedVideo}
	 */
	updateEngagement(metrics) {
		Object.assign(this.instagram.engagement, metrics);
		this.touch();
		return this;
	}

	/**
	 * Check if video meets platform requirements
	 * @param {Object} platformRequirements - Platform requirements to check
	 * @returns {{meetsRequirements: boolean, issues: string[]}}
	 */
	checkPlatformRequirements(platformRequirements) {
		const issues = [];

		// Check file size
		if (
			platformRequirements.maxFileSize &&
			this.properties.fileSize > platformRequirements.maxFileSize
		) {
			issues.push(
				`File size (${(this.properties.fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(platformRequirements.maxFileSize / 1024 / 1024).toFixed(2)}MB)`
			);
		}

		// Check duration
		if (
			platformRequirements.maxDuration &&
			this.properties.duration > platformRequirements.maxDuration
		) {
			issues.push(
				`Duration (${(this.properties.duration / 1000).toFixed(1)}s) exceeds maximum (${(platformRequirements.maxDuration / 1000).toFixed(1)}s)`
			);
		}

		// Check aspect ratio
		if (platformRequirements.requiredAspectRatio) {
			const actualRatio = `${this.properties.width}:${this.properties.height}`;
			// Normalize common ratios
			const ratioMap = {
				'1080:1080': '1:1',
				'1080:1350': '4:5',
				'1080:1920': '9:16',
				'1920:1080': '16:9'
			};
			const normalizedRatio = ratioMap[actualRatio] || actualRatio;

			if (normalizedRatio !== platformRequirements.requiredAspectRatio) {
				issues.push(
					`Aspect ratio (${normalizedRatio}) does not match required (${platformRequirements.requiredAspectRatio})`
				);
			}
		}

		return {
			meetsRequirements: issues.length === 0,
			issues
		};
	}

	/**
	 * Validate exported video
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (this.exportStatus.phase === 'failed') {
			errors.push(`Export failed: ${this.exportStatus.error}`);
		}

		if (this.exportStatus.phase !== 'complete') {
			errors.push(`Export not complete (current phase: ${this.exportStatus.phase})`);
		}

		if (!this.filePath || this.filePath.trim() === '') {
			errors.push('Output file path is required');
		}

		if (this.properties.fileSize === 0) {
			errors.push('Video file size is 0 bytes');
		}

		if (this.properties.duration === 0) {
			errors.push('Video duration is 0');
		}

		if (!this.quality.passedValidation) {
			warnings.push('Video has not passed quality validation');
		}

		if (this.quality.validationErrors.length > 0) {
			errors.push(...this.quality.validationErrors.map((e) => `Quality: ${e}`));
		}

		warnings.push(...this.quality.warnings.map((w) => `Quality: ${w}`));

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone video record with new ID
	 * @returns {ExportedVideo}
	 */
	clone() {
		const cloned = new ExportedVideo();

		cloned.filePath = this.filePath;
		cloned.thumbnailPath = this.thumbnailPath;
		cloned.properties = JSON.parse(JSON.stringify(this.properties));
		cloned.sources = JSON.parse(JSON.stringify(this.sources));
		// Don't clone export status or Instagram data - new export starts fresh

		return cloned;
	}

	/**
	 * Serialize video to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			filePath: this.filePath,
			thumbnailPath: this.thumbnailPath,
			properties: this.properties,
			exportStatus: this.exportStatus,
			sources: this.sources,
			instagram: this.instagram,
			quality: this.quality,
			metadata: this.metadata
		};
	}

	/**
	 * Create video from JSON data
	 * @param {Object} data - JSON data
	 * @returns {ExportedVideo}
	 */
	static fromJSON(data) {
		const video = new ExportedVideo();

		video.id = data.id || video.id;
		video.filePath = data.filePath || '';
		video.thumbnailPath = data.thumbnailPath || null;
		video.properties = { ...video.properties, ...data.properties };
		video.exportStatus = { ...video.exportStatus, ...data.exportStatus };
		video.sources = { ...video.sources, ...data.sources };
		video.instagram = {
			...video.instagram,
			...data.instagram,
			engagement: { ...video.instagram.engagement, ...data.instagram?.engagement }
		};
		video.quality = { ...video.quality, ...data.quality };
		video.metadata = { ...video.metadata, ...data.metadata };

		return video;
	}
}
