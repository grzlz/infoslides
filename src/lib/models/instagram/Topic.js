/**
 * @typedef {Object} LearningObjective
 * @property {string} description - What the viewer will learn
 * @property {string} type - Type of learning (concept, syntax, pattern, etc.)
 */

/**
 * Topic model representing a Go programming topic for educational content
 * Manages topic metadata, difficulty, and scheduling for daily content generation
 */
export class Topic {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Topic title (e.g., "Why Learn Go?", "Goroutines Basics") */
		this.title = '';

		/** @type {string} Category (e.g., "intro", "basics", "concurrency", "advanced") */
		this.category = 'basics';

		/** @type {string} Difficulty level: 'beginner' | 'intermediate' | 'advanced' */
		this.difficulty = 'beginner';

		/** @type {string} Brief description of the topic */
		this.description = '';

		/** @type {string[]} Key concepts covered in this topic */
		this.keywords = [];

		/** @type {LearningObjective[]} What viewers will learn */
		this.learningObjectives = [];

		/** @type {string[]} Array of related topic IDs (for progression) */
		this.relatedTopics = [];

		/** @type {string[]} Prerequisites topic IDs (what should be learned first) */
		this.prerequisites = [];

		/** @type {number} Estimated duration to understand this topic (minutes) */
		this.estimatedDuration = 5;

		/** @type {Object} Scheduling information */
		this.scheduling = {
			dayNumber: null, // Which day in the content schedule (1, 2, 3, ...)
			scheduledDate: null, // Specific date if scheduled
			published: false,
			publishedDate: null
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	/**
	 * Generate unique topic ID
	 * @returns {string}
	 */
	generateId() {
		return `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp
	 * @returns {Topic}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		return this;
	}

	/**
	 * Add a keyword to the topic
	 * @param {string} keyword - Keyword to add
	 * @returns {Topic}
	 */
	addKeyword(keyword) {
		if (!this.keywords.includes(keyword)) {
			this.keywords.push(keyword);
			this.touch();
		}
		return this;
	}

	/**
	 * Add a learning objective
	 * @param {string} description - What will be learned
	 * @param {string} [type='concept'] - Type of learning
	 * @returns {Topic}
	 */
	addLearningObjective(description, type = 'concept') {
		this.learningObjectives.push({ description, type });
		this.touch();
		return this;
	}

	/**
	 * Add a related topic reference
	 * @param {string} topicId - Related topic ID
	 * @returns {Topic}
	 */
	addRelatedTopic(topicId) {
		if (!this.relatedTopics.includes(topicId)) {
			this.relatedTopics.push(topicId);
			this.touch();
		}
		return this;
	}

	/**
	 * Add a prerequisite topic
	 * @param {string} topicId - Prerequisite topic ID
	 * @returns {Topic}
	 */
	addPrerequisite(topicId) {
		if (!this.prerequisites.includes(topicId)) {
			this.prerequisites.push(topicId);
			this.touch();
		}
		return this;
	}

	/**
	 * Schedule this topic for a specific day
	 * @param {number} dayNumber - Day number in content schedule
	 * @returns {Topic}
	 */
	scheduleForDay(dayNumber) {
		this.scheduling.dayNumber = dayNumber;
		this.touch();
		return this;
	}

	/**
	 * Schedule this topic for a specific date
	 * @param {Date|string} date - Date to schedule
	 * @returns {Topic}
	 */
	scheduleForDate(date) {
		this.scheduling.scheduledDate = date instanceof Date ? date.toISOString() : date;
		this.touch();
		return this;
	}

	/**
	 * Mark topic as published
	 * @returns {Topic}
	 */
	markAsPublished() {
		this.scheduling.published = true;
		this.scheduling.publishedDate = new Date().toISOString();
		this.touch();
		return this;
	}

	/**
	 * Validate topic data
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (!this.title || this.title.trim() === '') {
			errors.push('Topic title is required');
		}

		if (!['beginner', 'intermediate', 'advanced'].includes(this.difficulty)) {
			errors.push('Difficulty must be "beginner", "intermediate", or "advanced"');
		}

		if (!this.description || this.description.trim() === '') {
			warnings.push('Topic description is recommended');
		}

		if (this.keywords.length === 0) {
			warnings.push('No keywords defined - consider adding keywords for searchability');
		}

		if (this.learningObjectives.length === 0) {
			warnings.push('No learning objectives defined - consider adding what viewers will learn');
		}

		if (this.estimatedDuration <= 0) {
			errors.push('Estimated duration must be greater than 0');
		}

		if (this.estimatedDuration > 30) {
			warnings.push('Estimated duration exceeds 30 minutes - may be too complex for short-form content');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone topic with new ID
	 * @returns {Topic}
	 */
	clone() {
		const cloned = new Topic();

		cloned.title = this.title;
		cloned.category = this.category;
		cloned.difficulty = this.difficulty;
		cloned.description = this.description;
		cloned.keywords = [...this.keywords];
		cloned.learningObjectives = JSON.parse(JSON.stringify(this.learningObjectives));
		cloned.relatedTopics = [...this.relatedTopics];
		cloned.prerequisites = [...this.prerequisites];
		cloned.estimatedDuration = this.estimatedDuration;
		cloned.scheduling = { ...this.scheduling, published: false, publishedDate: null };

		return cloned;
	}

	/**
	 * Serialize topic to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			category: this.category,
			difficulty: this.difficulty,
			description: this.description,
			keywords: this.keywords,
			learningObjectives: this.learningObjectives,
			relatedTopics: this.relatedTopics,
			prerequisites: this.prerequisites,
			estimatedDuration: this.estimatedDuration,
			scheduling: this.scheduling,
			metadata: this.metadata
		};
	}

	/**
	 * Create topic from JSON data
	 * @param {Object} data - JSON data
	 * @returns {Topic}
	 */
	static fromJSON(data) {
		const topic = new Topic();

		topic.id = data.id || topic.id;
		topic.title = data.title || '';
		topic.category = data.category || 'basics';
		topic.difficulty = data.difficulty || 'beginner';
		topic.description = data.description || '';
		topic.keywords = data.keywords || [];
		topic.learningObjectives = data.learningObjectives || [];
		topic.relatedTopics = data.relatedTopics || [];
		topic.prerequisites = data.prerequisites || [];
		topic.estimatedDuration = data.estimatedDuration || 5;
		topic.scheduling = { ...topic.scheduling, ...data.scheduling };
		topic.metadata = { ...topic.metadata, ...data.metadata };

		return topic;
	}
}
