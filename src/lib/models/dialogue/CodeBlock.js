/**
 * @typedef {Object} CodeHighlight
 * @property {number} startLine - Starting line number (1-indexed)
 * @property {number} endLine - Ending line number (1-indexed)
 * @property {string} color - Highlight color (e.g., '#FFFF00')
 * @property {string} label - Label for highlighted section
 */

/**
 * CodeBlock model representing a code snippet in dialogue
 * Handles syntax highlighting, line numbering, and code metadata
 */
export class CodeBlock {
	constructor() {
		/** @type {string} Unique identifier */
		this.id = this.generateId();

		/** @type {string} Programming language (default: 'go') */
		this.language = 'go';

		/** @type {string} The actual code content */
		this.code = '';

		/** @type {string|null} Optional title/description of code */
		this.title = null;

		/** @type {boolean} Whether to show line numbers */
		this.showLineNumbers = true;

		/** @type {number} Starting line number (for context) */
		this.startLineNumber = 1;

		/** @type {CodeHighlight[]} Lines or sections to highlight */
		this.highlights = [];

		/** @type {string} Theme for syntax highlighting */
		this.theme = 'monokai'; // vs-dark, github-light, monokai, etc.

		/** @type {Object} Style configuration */
		this.style = {
			fontSize: '14px',
			fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
			padding: '16px',
			borderRadius: '8px',
			maxHeight: '400px'
		};

		/** @type {Object} Metadata */
		this.metadata = {
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			linesCount: 0
		};

		this.updateLinesCount();
	}

	/**
	 * Generate unique code block ID
	 * @returns {string}
	 */
	generateId() {
		return `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Update metadata timestamp and lines count
	 * @returns {CodeBlock}
	 */
	touch() {
		this.metadata.updatedAt = new Date().toISOString();
		this.updateLinesCount();
		return this;
	}

	/**
	 * Update lines count based on code content
	 * @returns {CodeBlock}
	 */
	updateLinesCount() {
		this.metadata.linesCount = this.code.split('\n').length;
		return this;
	}

	/**
	 * Add a highlight to specific lines
	 * @param {number} startLine - Starting line (1-indexed)
	 * @param {number} endLine - Ending line (1-indexed)
	 * @param {string} color - Highlight color
	 * @param {string} [label=''] - Optional label
	 * @returns {CodeBlock}
	 */
	addHighlight(startLine, endLine, color = '#FFFF00', label = '') {
		this.highlights.push({
			startLine,
			endLine,
			color,
			label
		});
		this.touch();
		return this;
	}

	/**
	 * Clear all highlights
	 * @returns {CodeBlock}
	 */
	clearHighlights() {
		this.highlights = [];
		this.touch();
		return this;
	}

	/**
	 * Validate code block data
	 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
	 */
	validate() {
		const errors = [];
		const warnings = [];

		if (!this.code || this.code.trim() === '') {
			errors.push('Code content is required');
		}

		if (!this.language) {
			errors.push('Language is required');
		}

		// Check for extremely long code
		if (this.metadata.linesCount > 50) {
			warnings.push('Code block has more than 50 lines - may be too long for mobile display');
		}

		// Validate highlights
		this.highlights.forEach((highlight, index) => {
			if (highlight.startLine > this.metadata.linesCount) {
				errors.push(
					`Highlight ${index + 1}: startLine (${highlight.startLine}) exceeds code length (${this.metadata.linesCount})`
				);
			}
			if (highlight.endLine > this.metadata.linesCount) {
				errors.push(
					`Highlight ${index + 1}: endLine (${highlight.endLine}) exceeds code length (${this.metadata.linesCount})`
				);
			}
			if (highlight.startLine > highlight.endLine) {
				errors.push(`Highlight ${index + 1}: startLine cannot be greater than endLine`);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Clone code block with new ID
	 * @returns {CodeBlock}
	 */
	clone() {
		const cloned = new CodeBlock();

		cloned.language = this.language;
		cloned.code = this.code;
		cloned.title = this.title;
		cloned.showLineNumbers = this.showLineNumbers;
		cloned.startLineNumber = this.startLineNumber;
		cloned.highlights = JSON.parse(JSON.stringify(this.highlights));
		cloned.theme = this.theme;
		cloned.style = JSON.parse(JSON.stringify(this.style));

		cloned.updateLinesCount();

		return cloned;
	}

	/**
	 * Serialize code block to JSON
	 * @returns {Object}
	 */
	toJSON() {
		return {
			id: this.id,
			language: this.language,
			code: this.code,
			title: this.title,
			showLineNumbers: this.showLineNumbers,
			startLineNumber: this.startLineNumber,
			highlights: this.highlights,
			theme: this.theme,
			style: this.style,
			metadata: this.metadata
		};
	}

	/**
	 * Create code block from JSON data
	 * @param {Object} data - JSON data
	 * @returns {CodeBlock}
	 */
	static fromJSON(data) {
		const codeBlock = new CodeBlock();

		codeBlock.id = data.id || codeBlock.id;
		codeBlock.language = data.language || 'go';
		codeBlock.code = data.code || '';
		codeBlock.title = data.title || null;
		codeBlock.showLineNumbers = data.showLineNumbers ?? true;
		codeBlock.startLineNumber = data.startLineNumber || 1;
		codeBlock.highlights = data.highlights || [];
		codeBlock.theme = data.theme || 'monokai';
		codeBlock.style = { ...codeBlock.style, ...data.style };
		codeBlock.metadata = { ...codeBlock.metadata, ...data.metadata };

		codeBlock.updateLinesCount();

		return codeBlock;
	}
}
