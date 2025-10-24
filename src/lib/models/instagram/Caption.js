/**
 * @typedef {Object} MentionedAccount
 * @property {string} username - Instagram username (without @)
 * @property {string} displayName - Display name
 */

/**
 * Caption model for Instagram post captions with hashtags and engagement features
 * Manages caption text, hashtags, mentions, and call-to-actions
 */
export class Caption {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Main caption text */
		this.text = '';

		/** @type {string[]} Array of hashtags (without #) */
		this.hashtags = [];

		/** @type {MentionedAccount[]} Accounts mentioned in caption */
		this.mentions = [];

		/** @type {string[]} Emojis used in caption */
		this.emojis = [];

		/** @type {string|null} Call-to-action text */
		this.callToAction = null;

		/** @type {Object} Engagement settings */
		this.engagement = {
			includeQuestion: false, // Ask viewers a question
			question: null,
			encourageComments: true,
			encourageShares: true,
			encourageSaves: false
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			totalLength: 0, // Total characters including hashtags
			hashtagCount: 0
		};

		this.updateCounts();
	}

	/**
	 * Generate unique caption ID
	 * @returns {string}
	 */
	generateId() {
		return `caption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp and counts
	 * @returns {Caption}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		this.updateCounts();
		return this;
	}

	/**
	 * Update character and hashtag counts
	 * @returns {Caption}
	 */
	updateCounts() {
		const hashtagText = this.hashtags.map((h) => `#${h}`).join(' ');
		this.metadata.totalLength = this.text.length + (hashtagText ? hashtagText.length + 3 : 0); // +3 for "\n\n"
		this.metadata.hashtagCount = this.hashtags.length;
		return this;
	}

	/**
	 * Add a hashtag
	 * @param {string} hashtag - Hashtag without # symbol
	 * @returns {Caption}
	 */
	addHashtag(hashtag) {
		// Remove # if present
		const cleanHashtag = hashtag.replace(/^#/, '').trim().toLowerCase();

		if (cleanHashtag && !this.hashtags.includes(cleanHashtag)) {
			this.hashtags.push(cleanHashtag);
			this.touch();
		}
		return this;
	}

	/**
	 * Add multiple hashtags
	 * @param {string[]} hashtags - Array of hashtags
	 * @returns {Caption}
	 */
	addHashtags(hashtags) {
		hashtags.forEach((tag) => this.addHashtag(tag));
		return this;
	}

	/**
	 * Remove a hashtag
	 * @param {string} hashtag - Hashtag to remove
	 * @returns {Caption}
	 */
	removeHashtag(hashtag) {
		const cleanHashtag = hashtag.replace(/^#/, '').trim().toLowerCase();
		this.hashtags = this.hashtags.filter((h) => h !== cleanHashtag);
		this.touch();
		return this;
	}

	/**
	 * Add a mention
	 * @param {string} username - Instagram username (without @)
	 * @param {string} [displayName=''] - Display name
	 * @returns {Caption}
	 */
	addMention(username, displayName = '') {
		const cleanUsername = username.replace(/^@/, '').trim();

		if (!this.mentions.find((m) => m.username === cleanUsername)) {
			this.mentions.push({
				username: cleanUsername,
				displayName: displayName || cleanUsername
			});
			this.touch();
		}
		return this;
	}

	/**
	 * Add an emoji
	 * @param {string} emoji - Emoji character
	 * @returns {Caption}
	 */
	addEmoji(emoji) {
		if (!this.emojis.includes(emoji)) {
			this.emojis.push(emoji);
			this.touch();
		}
		return this;
	}

	/**
	 * Set call-to-action text
	 * @param {string} cta - Call to action text
	 * @returns {Caption}
	 */
	setCallToAction(cta) {
		this.callToAction = cta;
		this.touch();
		return this;
	}

	/**
	 * Add an engagement question
	 * @param {string} question - Question to ask viewers
	 * @returns {Caption}
	 */
	addQuestion(question) {
		this.engagement.includeQuestion = true;
		this.engagement.question = question;
		this.touch();
		return this;
	}

	/**
	 * Get full formatted caption (text + hashtags)
	 * @param {boolean} [includeHashtags=true] - Whether to include hashtags
	 * @returns {string}
	 */
	getFormattedCaption(includeHashtags = true) {
		let caption = this.text;

		if (this.callToAction) {
			caption += `\n\n${this.callToAction}`;
		}

		if (this.engagement.includeQuestion && this.engagement.question) {
			caption += `\n\n${this.engagement.question}`;
		}

		if (includeHashtags && this.hashtags.length > 0) {
			const hashtagText = this.hashtags.map((h) => `#${h}`).join(' ');
			caption += `\n\n${hashtagText}`;
		}

		return caption;
	}

	/**
	 * Validate caption data
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		// Instagram caption limit is 2200 characters
		if (this.metadata.totalLength > 2200) {
			errors.push(
				`Caption length (${this.metadata.totalLength}) exceeds Instagram's 2200 character limit`
			);
		}

		if (this.text.trim() === '') {
			warnings.push('Caption text is empty');
		}

		// Hashtag recommendations
		if (this.hashtags.length === 0) {
			warnings.push('No hashtags - consider adding hashtags for discoverability');
		}

		if (this.hashtags.length > 30) {
			warnings.push(
				`Using ${this.hashtags.length} hashtags may look spammy. Instagram recommends 3-10 hashtags`
			);
		}

		// Check for banned/spam hashtags patterns
		this.hashtags.forEach((hashtag) => {
			if (hashtag.length < 2) {
				warnings.push(`Hashtag "${hashtag}" is too short (min 2 characters)`);
			}

			if (hashtag.length > 50) {
				warnings.push(`Hashtag "${hashtag}" is too long (max 50 characters)`);
			}

			// Check for spaces or special characters
			if (!/^[a-z0-9_]+$/i.test(hashtag)) {
				errors.push(
					`Hashtag "${hashtag}" contains invalid characters (only letters, numbers, underscores allowed)`
				);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone caption with new ID
	 * @returns {Caption}
	 */
	clone() {
		const cloned = new Caption();

		cloned.text = this.text;
		cloned.hashtags = [...this.hashtags];
		cloned.mentions = JSON.parse(JSON.stringify(this.mentions));
		cloned.emojis = [...this.emojis];
		cloned.callToAction = this.callToAction;
		cloned.engagement = JSON.parse(JSON.stringify(this.engagement));

		cloned.updateCounts();

		return cloned;
	}

	/**
	 * Serialize caption to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			text: this.text,
			hashtags: this.hashtags,
			mentions: this.mentions,
			emojis: this.emojis,
			callToAction: this.callToAction,
			engagement: this.engagement,
			metadata: this.metadata
		};
	}

	/**
	 * Create caption from JSON data
	 * @param {Object} data - JSON data
	 * @returns {Caption}
	 */
	static fromJSON(data) {
		const caption = new Caption();

		caption.id = data.id || caption.id;
		caption.text = data.text || '';
		caption.hashtags = data.hashtags || [];
		caption.mentions = data.mentions || [];
		caption.emojis = data.emojis || [];
		caption.callToAction = data.callToAction || null;
		caption.engagement = { ...caption.engagement, ...data.engagement };
		caption.metadata = { ...caption.metadata, ...data.metadata };

		caption.updateCounts();

		return caption;
	}
}
