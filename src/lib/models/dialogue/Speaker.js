/**
 * @typedef {Object} SpeakerStyle
 * @property {string} bubbleColor - Background color for dialogue bubble
 * @property {string} textColor - Text color for dialogue
 * @property {string} fontFamily - Font family for speaker's text
 * @property {string} fontSize - Font size for dialogue text
 * @property {string} avatarPosition - Position of avatar (left|right)
 */

/**
 * Speaker model representing a character in dialogue (e.g., Kobe Bryant, Kanye West)
 * Defines the personality, visual style, and metadata for dialogue participants
 */
export class Speaker {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Speaker name (e.g., "KOBE BRYANT") */
		this.name = '';

		/** @type {string} Speaker role: 'expert' | 'novice' */
		this.role = 'novice';

		/** @type {string|null} URL or path to speaker avatar/photo */
		this.avatarUrl = null;

		/** @type {SpeakerStyle} Visual styling for this speaker's dialogue */
		this.style = {
			bubbleColor: '#FFFFFF',
			textColor: '#000000',
			fontFamily: 'sans-serif',
			fontSize: '16px',
			avatarPosition: 'left'
		};

		/** @type {Object} Speaker personality traits and speaking patterns */
		this.personality = {
			description: '', // e.g., "The Mamba Mentality Developer"
			tone: 'neutral', // serious, chaotic, humorous, etc.
			speakingStyle: '' // e.g., "Rapid-fire technical explanations"
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	/**
	 * Generate unique speaker ID
	 * @returns {string}
	 */
	generateId() {
		return `speaker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {Speaker}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Validate speaker data
	 * @returns {{isValid: boolean, errors: string[]}}
	 */
	validate() {
		const errors = [];

		if (!this.name || this.name.trim() === '') {
			errors.push('Speaker name is required');
		}

		if (!['expert', 'novice'].includes(this.role)) {
			errors.push('Speaker role must be "expert" or "novice"');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	/**
	 * Clone speaker with new ID
	 * @returns {Speaker}
	 */
	clone() {
		const cloned = new Speaker();

		cloned.name = this.name;
		cloned.role = this.role;
		cloned.avatarUrl = this.avatarUrl;
		cloned.style = JSON.parse(JSON.stringify(this.style));
		cloned.personality = JSON.parse(JSON.stringify(this.personality));

		return cloned;
	}

	/**
	 * Serialize speaker to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			name: this.name,
			role: this.role,
			avatarUrl: this.avatarUrl,
			style: this.style,
			personality: this.personality,
			metadata: this.metadata
		};
	}

	/**
	 * Create speaker from JSON data
	 * @param {Object} data - JSON data
	 * @returns {Speaker}
	 */
	static fromJSON(data) {
		const speaker = new Speaker();

		speaker.id = data.id || speaker.id;
		speaker.name = data.name || '';
		speaker.role = data.role || 'novice';
		speaker.avatarUrl = data.avatarUrl || null;
		speaker.style = { ...speaker.style, ...data.style };
		speaker.personality = { ...speaker.personality, ...data.personality };
		speaker.metadata = { ...speaker.metadata, ...data.metadata };

		return speaker;
	}

	/**
	 * Create predefined speaker: Kobe Bryant (Expert)
	 * @returns {Speaker}
	 */
	static createKobeBryant() {
		const kobe = new Speaker();
		kobe.name = 'KOBE BRYANT';
		kobe.role = 'expert';
		kobe.style = {
			bubbleColor: '#552583', // Lakers purple
			textColor: '#FDB927', // Lakers gold
			fontFamily: 'Helvetica, Arial, sans-serif',
			fontSize: '16px',
			avatarPosition: 'left'
		};
		kobe.personality = {
			description: 'The Mamba Mentality Developer',
			tone: 'serious',
			speakingStyle: 'Rapid-fire technical explanations with discipline focus'
		};
		return kobe;
	}

	/**
	 * Create predefined speaker: Kanye West (Novice)
	 * @returns {Speaker}
	 */
	static createKanyeWest() {
		const kanye = new Speaker();
		kanye.name = 'KANYE WEST';
		kanye.role = 'novice';
		kanye.style = {
			bubbleColor: '#000000',
			textColor: '#FFFFFF',
			fontFamily: 'Impact, "Arial Black", sans-serif',
			fontSize: '18px',
			avatarPosition: 'right'
		};
		kanye.personality = {
			description: 'The Chaotic Learner',
			tone: 'chaotic',
			speakingStyle: 'Stream of consciousness interruptions and bold questions'
		};
		return kanye;
	}
}
