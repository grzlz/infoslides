import { Speaker } from './Speaker.js';
import { Message } from './Message.js';

/**
 * DialogueContent model representing a complete conversation between speakers
 * Manages speakers, messages, and dialogue flow for Instagram Reels content
 */
export class DialogueContent {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string|null} Title of the dialogue/topic */
		this.title = null;

		/** @type {Speaker[]} Array of speakers in this dialogue */
		this.speakers = [];

		/** @type {Message[]} Array of messages in chronological order */
		this.messages = [];

		/** @type {number} Total duration of dialogue in milliseconds */
		this.duration = 0;

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			messageCount: 0,
			speakerCount: 0
		};

		this.updateCounts();
	}

	/**
	 * Generate unique dialogue ID
	 * @returns {string}
	 */
	generateId() {
		return `dialogue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp and counts
	 * @returns {DialogueContent}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		this.updateCounts();
		return this;
	}

	/**
	 * Update message and speaker counts
	 * @returns {DialogueContent}
	 */
	updateCounts() {
		this.metadata.messageCount = this.messages.length;
		this.metadata.speakerCount = this.speakers.length;
		return this;
	}

	/**
	 * Add a speaker to the dialogue
	 * @param {Speaker|Object} speaker - Speaker instance or data
	 * @returns {DialogueContent}
	 */
	addSpeaker(speaker) {
		if (speaker instanceof Speaker) {
			this.speakers.push(speaker);
		} else {
			this.speakers.push(Speaker.fromJSON(speaker));
		}
		this.touch();
		return this;
	}

	/**
	 * Get speaker by ID
	 * @param {string} speakerId - Speaker ID
	 * @returns {Speaker|null}
	 */
	getSpeakerById(speakerId) {
		return this.speakers.find((s) => s.id === speakerId) || null;
	}

	/**
	 * Get speaker by name
	 * @param {string} name - Speaker name
	 * @returns {Speaker|null}
	 */
	getSpeakerByName(name) {
		return this.speakers.find((s) => s.name === name) || null;
	}

	/**
	 * Add a message to the dialogue
	 * @param {Message|Object} message - Message instance or data
	 * @returns {DialogueContent}
	 */
	addMessage(message) {
		if (message instanceof Message) {
			this.messages.push(message);
		} else {
			this.messages.push(Message.fromJSON(message));
		}
		this.sortMessages();
		this.calculateDuration();
		this.touch();
		return this;
	}

	/**
	 * Sort messages by order/timestamp
	 * @returns {DialogueContent}
	 */
	sortMessages() {
		this.messages.sort((a, b) => {
			if (a.order !== b.order) return a.order - b.order;
			return a.timestamp - b.timestamp;
		});
		return this;
	}

	/**
	 * Calculate total dialogue duration based on messages
	 * @returns {DialogueContent}
	 */
	calculateDuration() {
		if (this.messages.length === 0) {
			this.duration = 0;
			return this;
		}

		// Find the last message timestamp + estimated reading time
		const lastMessage = this.messages[this.messages.length - 1];
		const readingTimePerChar = 50; // ms per character (adjust for natural speech)
		const additionalTime = lastMessage.text.length * readingTimePerChar;

		this.duration = lastMessage.timestamp + additionalTime;

		return this;
	}

	/**
	 * Get all messages from a specific speaker
	 * @param {string} speakerId - Speaker ID
	 * @returns {Message[]}
	 */
	getMessagesBySpeaker(speakerId) {
		return this.messages.filter((m) => m.speakerId === speakerId);
	}

	/**
	 * Clear all messages
	 * @returns {DialogueContent}
	 */
	clearMessages() {
		this.messages = [];
		this.duration = 0;
		this.touch();
		return this;
	}

	/**
	 * Clear all speakers
	 * @returns {DialogueContent}
	 */
	clearSpeakers() {
		this.speakers = [];
		this.touch();
		return this;
	}

	/**
	 * Validate dialogue content
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		// Validate speakers
		if (this.speakers.length === 0) {
			errors.push('Dialogue must have at least one speaker');
		}

		if (this.speakers.length > 10) {
			warnings.push('Dialogue has more than 10 speakers - this may be too many for clarity');
		}

		this.speakers.forEach((speaker, index) => {
			const speakerValidation = speaker.validate();
			if (!speakerValidation.isValid) {
				errors.push(
					...speakerValidation.errors.map((e) => `Speaker ${index + 1} (${speaker.name}): ${e}`)
				);
			}
		});

		// Validate messages
		if (this.messages.length === 0) {
			errors.push('Dialogue must have at least one message');
		}

		if (this.messages.length > 50) {
			warnings.push(
				'Dialogue has more than 50 messages - may be too long for Instagram Reels format'
			);
		}

		this.messages.forEach((message, index) => {
			const messageValidation = message.validate();
			if (!messageValidation.isValid) {
				errors.push(...messageValidation.errors.map((e) => `Message ${index + 1}: ${e}`));
			}
			warnings.push(...messageValidation.warnings.map((w) => `Message ${index + 1}: ${w}`));

			// Check if speaker exists
			const speakerExists = this.speakers.some((s) => s.id === message.speakerId);
			if (!speakerExists) {
				errors.push(
					`Message ${index + 1}: References non-existent speaker ID ${message.speakerId}`
				);
			}
		});

		// Validate duration for Instagram Reels
		if (this.duration > 90000) {
			warnings.push(
				`Dialogue duration (${Math.round(this.duration / 1000)}s) exceeds recommended 90s for Instagram Reels`
			);
		}

		if (this.duration < 5000) {
			warnings.push(
				`Dialogue duration (${Math.round(this.duration / 1000)}s) is less than 5s - may be too short`
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone dialogue with new ID
	 * @returns {DialogueContent}
	 */
	clone() {
		const cloned = new DialogueContent();

		cloned.title = this.title;
		cloned.speakers = this.speakers.map((s) => s.clone());
		cloned.messages = this.messages.map((m) => m.clone());
		cloned.duration = this.duration;

		cloned.updateCounts();

		return cloned;
	}

	/**
	 * Serialize dialogue to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			speakers: this.speakers.map((s) => s.toJSON()),
			messages: this.messages.map((m) => m.toJSON()),
			duration: this.duration,
			metadata: this.metadata
		};
	}

	/**
	 * Create dialogue from JSON data
	 * @param {Object} data - JSON data
	 * @returns {DialogueContent}
	 */
	static fromJSON(data) {
		const dialogue = new DialogueContent();

		dialogue.id = data.id || dialogue.id;
		dialogue.title = data.title || null;
		dialogue.speakers = (data.speakers || []).map((s) => Speaker.fromJSON(s));
		dialogue.messages = (data.messages || []).map((m) => Message.fromJSON(m));
		dialogue.duration = data.duration || 0;
		dialogue.metadata = { ...dialogue.metadata, ...data.metadata };

		dialogue.sortMessages();
		dialogue.updateCounts();

		return dialogue;
	}

	/**
	 * Create a Kobe & Kanye dialogue template
	 * @param {string} title - Dialogue title
	 * @returns {DialogueContent}
	 */
	static createKobeKanyeTemplate(title = 'Learn Go') {
		const dialogue = new DialogueContent();
		dialogue.title = title;

		// Add speakers
		dialogue.addSpeaker(Speaker.createKobeBryant());
		dialogue.addSpeaker(Speaker.createKanyeWest());

		return dialogue;
	}
}
