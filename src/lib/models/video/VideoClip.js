/**
 * @typedef {Object} VideoMetadata
 * @property {number} width - Video width in pixels
 * @property {number} height - Video height in pixels
 * @property {number} fps - Frames per second
 * @property {number} duration - Duration in milliseconds
 * @property {string} codec - Video codec
 * @property {number} fileSize - File size in bytes
 */

/**
 * VideoClip model representing a background video clip (e.g., Minecraft parkour footage)
 * Manages clip metadata, selection, and usage tracking
 */
export class VideoClip {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} File path or URL to video file */
		this.filePath = '';

		/** @type {string} Clip name/title */
		this.name = '';

		/** @type {string} Category/theme (e.g., 'minecraft-parkour', 'minecraft-speedrun') */
		this.category = 'minecraft-parkour';

		/** @type {VideoMetadata} Video technical metadata */
		this.videoMetadata = {
			width: 1920,
			height: 1080,
			fps: 60,
			duration: 0,
			codec: 'h264',
			fileSize: 0
		};

		/** @type {Object} Segment information for trimming */
		this.segment = {
			startTime: 0, // ms from beginning of source video
			endTime: 0, // ms from beginning of source video
			duration: 0 // calculated duration of this segment
		};

		/** @type {Object} Usage tracking */
		this.usage = {
			timesUsed: 0,
			lastUsedAt: null,
			usedInVideos: [] // Array of video IDs that used this clip
		};

		/** @type {string[]} Tags for filtering/searching */
		this.tags = [];

		/** @type {Object} Quality assessment */
		this.quality = {
			hasAudio: true,
			hasWatermark: false,
			visualQuality: 'high', // low, medium, high
			interestLevel: 'medium' // low, medium, high (how engaging the clip is)
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			importedAt: null,
			source: null // Original source/attribution
		};
	}

	/**
	 * Generate unique clip ID
	 * @returns {string}
	 */
	generateId() {
		return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {VideoClip}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Set video segment (trim)
	 * @param {number} startMs - Start time in milliseconds
	 * @param {number} endMs - End time in milliseconds
	 * @returns {VideoClip}
	 */
	setSegment(startMs, endMs) {
		this.segment.startTime = startMs;
		this.segment.endTime = endMs;
		this.segment.duration = endMs - startMs;
		this.touch();
		return this;
	}

	/**
	 * Add a tag
	 * @param {string} tag - Tag to add
	 * @returns {VideoClip}
	 */
	addTag(tag) {
		const cleanTag = tag.trim().toLowerCase();
		if (cleanTag && !this.tags.includes(cleanTag)) {
			this.tags.push(cleanTag);
			this.touch();
		}
		return this;
	}

	/**
	 * Record usage of this clip
	 * @param {string} videoId - ID of video that used this clip
	 * @returns {VideoClip}
	 */
	recordUsage(videoId) {
		this.usage.timesUsed++;
		this.usage.lastUsedAt = new Date().toISOString();
		if (videoId && !this.usage.usedInVideos.includes(videoId)) {
			this.usage.usedInVideos.push(videoId);
		}
		this.touch();
		return this;
	}

	/**
	 * Check if clip was recently used (within last N videos)
	 * @param {number} [threshold=5] - Number of recent uses to check
	 * @returns {boolean}
	 */
	isRecentlyUsed(threshold = 5) {
		return this.usage.usedInVideos.slice(-threshold).length >= threshold;
	}

	/**
	 * Calculate usage score (for clip selection algorithm)
	 * @returns {number} Score from 0-100 (higher = better to use)
	 */
	calculateUsageScore() {
		let score = 50; // Base score

		// Penalize recently used clips
		if (this.usage.timesUsed > 0) {
			const daysSinceLastUse = this.usage.lastUsedAt
				? (Date.now() - new Date(this.usage.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24)
				: 999;

			if (daysSinceLastUse < 7) {
				score -= 30; // Used in last week
			} else if (daysSinceLastUse < 30) {
				score -= 15; // Used in last month
			}
		}

		// Bonus for high quality
		if (this.quality.visualQuality === 'high') {
			score += 20;
		} else if (this.quality.visualQuality === 'low') {
			score -= 10;
		}

		// Bonus for high interest level
		if (this.quality.interestLevel === 'high') {
			score += 15;
		} else if (this.quality.interestLevel === 'low') {
			score -= 10;
		}

		// Penalty for watermarks
		if (this.quality.hasWatermark) {
			score -= 20;
		}

		return Math.max(0, Math.min(100, score));
	}

	/**
	 * Validate clip data
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (!this.filePath || this.filePath.trim() === '') {
			errors.push('Video file path is required');
		}

		if (this.videoMetadata.duration <= 0) {
			errors.push('Video duration must be greater than 0');
		}

		if (this.segment.startTime >= this.segment.endTime) {
			errors.push('Segment start time must be less than end time');
		}

		if (this.segment.endTime > this.videoMetadata.duration) {
			errors.push(
				`Segment end time (${this.segment.endTime}ms) exceeds video duration (${this.videoMetadata.duration}ms)`
			);
		}

		if (this.segment.duration < 5000) {
			warnings.push(
				`Segment duration (${this.segment.duration / 1000}s) is less than 5 seconds - may be too short`
			);
		}

		if (this.quality.hasWatermark) {
			warnings.push('Clip contains watermark - may affect visual quality');
		}

		if (!this.quality.hasAudio) {
			warnings.push('Clip has no audio - will need background music or voiceover');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone clip with new ID
	 * @returns {VideoClip}
	 */
	clone() {
		const cloned = new VideoClip();

		cloned.filePath = this.filePath;
		cloned.name = this.name;
		cloned.category = this.category;
		cloned.videoMetadata = JSON.parse(JSON.stringify(this.videoMetadata));
		cloned.segment = JSON.parse(JSON.stringify(this.segment));
		cloned.tags = [...this.tags];
		cloned.quality = JSON.parse(JSON.stringify(this.quality));
		// Don't clone usage data - new clip starts fresh
		cloned.metadata.source = this.metadata.source;

		return cloned;
	}

	/**
	 * Serialize clip to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			filePath: this.filePath,
			name: this.name,
			category: this.category,
			videoMetadata: this.videoMetadata,
			segment: this.segment,
			usage: this.usage,
			tags: this.tags,
			quality: this.quality,
			metadata: this.metadata
		};
	}

	/**
	 * Create clip from JSON data
	 * @param {Object} data - JSON data
	 * @returns {VideoClip}
	 */
	static fromJSON(data) {
		const clip = new VideoClip();

		clip.id = data.id || clip.id;
		clip.filePath = data.filePath || '';
		clip.name = data.name || '';
		clip.category = data.category || 'minecraft-parkour';
		clip.videoMetadata = { ...clip.videoMetadata, ...data.videoMetadata };
		clip.segment = { ...clip.segment, ...data.segment };
		clip.usage = { ...clip.usage, ...data.usage };
		clip.tags = data.tags || [];
		clip.quality = { ...clip.quality, ...data.quality };
		clip.metadata = { ...clip.metadata, ...data.metadata };

		return clip;
	}
}
