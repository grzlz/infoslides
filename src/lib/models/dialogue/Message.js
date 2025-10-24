import { CodeBlock } from './CodeBlock.js';

/**
 * @typedef {Object} Animation
 * @property {string} type - Animation type (fade-in, slide-in, typing, etc.)
 * @property {number} duration - Duration in milliseconds
 * @property {number} delay - Delay before animation starts (ms)
 */

/**
 * Message model representing a single dialogue message from a speaker
 * Can contain text, code blocks, and animation metadata
 */
export class Message {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} ID of the speaker who said this */
		this.speakerId = '';

		/** @type {string} The message text */
		this.text = '';

		/** @type {CodeBlock|null} Optional code block attached to message */
		this.codeBlock = null;

		/** @type {number} Order/sequence number in dialogue */
		this.order = 0;

		/** @type {number} Timestamp when message appears (ms from start) */
		this.timestamp = 0;

		/** @type {Animation|null} Entrance animation for this message */
		this.animation = null;

		/** @type {boolean} Whether this message is an interruption */
		this.isInterruption = false;

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			characterCount: 0
		};

		this.updateCharacterCount();
	}

	/**
	 * Generate unique message ID
	 * @returns {string}
	 */
	generateId() {
		return `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp and character count
	 * @returns {Message}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		this.updateCharacterCount();
		return this;
	}

	/**
	 * Update character count based on text content
	 * @returns {Message}
	 */
	updateCharacterCount() {
		this.metadata.characterCount = this.text.length;
		return this;
	}

	/**
	 * Attach a code block to this message
	 * @param {CodeBlock|Object} codeBlock - Code block instance or data
	 * @returns {Message}
	 */
	attachCodeBlock(codeBlock) {
		if (codeBlock instanceof CodeBlock) {
			this.codeBlock = codeBlock;
		} else {
			this.codeBlock = CodeBlock.fromJSON(codeBlock);
		}
		this.touch();
		return this;
	}

	/**
	 * Remove attached code block
	 * @returns {Message}
	 */
	removeCodeBlock() {
		this.codeBlock = null;
		this.touch();
		return this;
	}

	/**
	 * Set animation for this message
	 * @param {string} type - Animation type
	 * @param {number} duration - Duration in milliseconds
	 * @param {number} [delay=0] - Delay before animation starts
	 * @returns {Message}
	 */
	setAnimation(type, duration, delay = 0) {
		this.animation = {
			type,
			duration,
			delay
		};
		this.touch();
		return this;
	}

	/**
	 * Mark this message as an interruption
	 * @returns {Message}
	 */
	markAsInterruption() {
		this.isInterruption = true;
		this.touch();
		return this;
	}

	/**
	 * Validate message data
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (!this.text || this.text.trim() === '') {
			errors.push('Message text is required');
		}

		if (!this.speakerId) {
			errors.push('Speaker ID is required');
		}

		if (this.order < 0) {
			errors.push('Message order must be >= 0');
		}

		if (this.timestamp < 0) {
			errors.push('Message timestamp must be >= 0');
		}

		// Check for very long messages
		if (this.metadata.characterCount > 280) {
			warnings.push(
				'Message is longer than 280 characters - may be too long for mobile display'
			);
		}

		// Validate attached code block
		if (this.codeBlock) {
			const codeValidation = this.codeBlock.validate();
			if (!codeValidation.isValid) {
				errors.push(...codeValidation.errors.map((e) => `Code block: ${e}`));
			}
			warnings.push(...codeValidation.warnings.map((w) => `Code block: ${w}`));
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone message with new ID
	 * @returns {Message}
	 */
	clone() {
		const cloned = new Message();

		cloned.speakerId = this.speakerId;
		cloned.text = this.text;
		cloned.codeBlock = this.codeBlock ? this.codeBlock.clone() : null;
		cloned.order = this.order;
		cloned.timestamp = this.timestamp;
		cloned.animation = this.animation ? JSON.parse(JSON.stringify(this.animation)) : null;
		cloned.isInterruption = this.isInterruption;

		cloned.updateCharacterCount();

		return cloned;
	}

	/**
	 * Serialize message to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			speakerId: this.speakerId,
			text: this.text,
			codeBlock: this.codeBlock ? this.codeBlock.toJSON() : null,
			order: this.order,
			timestamp: this.timestamp,
			animation: this.animation,
			isInterruption: this.isInterruption,
			metadata: this.metadata
		};
	}

	/**
	 * Create message from JSON data
	 * @param {Object} data - JSON data
	 * @returns {Message}
	 */
	static fromJSON(data) {
		const message = new Message();

		message.id = data.id || message.id;
		message.speakerId = data.speakerId || '';
		message.text = data.text || '';
		message.codeBlock = data.codeBlock ? CodeBlock.fromJSON(data.codeBlock) : null;
		message.order = data.order || 0;
		message.timestamp = data.timestamp || 0;
		message.animation = data.animation || null;
		message.isInterruption = data.isInterruption || false;
		message.metadata = { ...message.metadata, ...data.metadata };

		message.updateCharacterCount();

		return message;
	}
}
