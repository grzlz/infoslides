import { SlideBuilder } from '../patterns/SlideBuilder.js';

/**
 * DialogueSlideBuilder - Creates slides with Kobe & Kanye dialogue content
 * Extends SlideBuilder to implement the Builder Pattern for dialogue-based slides
 */
export class DialogueSlideBuilder extends SlideBuilder {
	constructor() {
		super();
		this.slide.type = 'dialogue';
	}

	/**
	 * Set slide title from dialogue title
	 * @param {string} title - Dialogue title
	 * @returns {DialogueSlideBuilder}
	 */
	setTitle(title) {
		this.slide.title = title;
		this.addBuildStep('setTitle', title);
		return this;
	}

	/**
	 * Set subtitle (optional for dialogue slides)
	 * @param {string} subtitle - Subtitle text
	 * @returns {DialogueSlideBuilder}
	 */
	setSubtitle(subtitle) {
		this.slide.subtitle = subtitle || null;
		this.addBuildStep('setSubtitle', subtitle);
		return this;
	}

	/**
	 * Set dialogue content
	 * @param {DialogueContent} dialogueContent - Full dialogue content object
	 * @returns {DialogueSlideBuilder}
	 */
	setContent(dialogueContent) {
		this.slide.content = {
			dialogue: dialogueContent.toJSON(),
			type: 'dialogue'
		};
		this.addBuildStep('setContent', { dialogueId: dialogueContent.id });
		return this;
	}

	/**
	 * Set layout configuration for dialogue display
	 * @param {string|Object} layout - Layout name or configuration
	 * @returns {DialogueSlideBuilder}
	 */
	setLayout(layout) {
		if (typeof layout === 'string') {
			this.slide.layout = {
				name: layout,
				type: 'dialogue',
				orientation: 'portrait', // Instagram Reels = 4:5 portrait
				dimensions: {
					width: 1080,
					height: 1350
				}
			};
		} else {
			this.slide.layout = { ...this.slide.layout, ...layout };
		}
		this.addBuildStep('setLayout', layout);
		return this;
	}

	/**
	 * Set style strategy (e.g., Instagram style)
	 * @param {Object} style - Style configuration
	 * @returns {DialogueSlideBuilder}
	 */
	setStyle(style) {
		this.slide.style = { ...this.slide.style, ...style };
		this.addBuildStep('setStyle', style);
		return this;
	}

	/**
	 * Add speaker information to slide assets
	 * @param {Speaker} speaker - Speaker object
	 * @returns {DialogueSlideBuilder}
	 */
	addSpeaker(speaker) {
		this.addAsset('speakers', speaker.toJSON());
		return this;
	}

	/**
	 * Add message to dialogue content
	 * @param {Message} message - Message object
	 * @returns {DialogueSlideBuilder}
	 */
	addMessage(message) {
		if (!this.slide.content.dialogue) {
			throw new Error('Must call setContent() with DialogueContent before adding messages');
		}
		// Messages are already in DialogueContent, this is for individual additions
		this.addAsset('messages', message.toJSON());
		return this;
	}

	/**
	 * Set Instagram-specific metadata
	 * @param {Object} instagramMeta - Instagram metadata
	 * @returns {DialogueSlideBuilder}
	 */
	setInstagramMetadata(instagramMeta) {
		this.setMetadata({
			instagram: instagramMeta,
			platform: 'instagram-reels'
		});
		return this;
	}

	/**
	 * Custom validation for dialogue slides
	 * @override
	 */
	customValidation() {
		// Validate dialogue content exists
		if (!this.slide.content.dialogue) {
			this.slide.addValidationError('Dialogue content is required');
			return;
		}

		const dialogue = this.slide.content.dialogue;

		// Validate speakers
		if (!dialogue.speakers || dialogue.speakers.length < 2) {
			this.slide.addValidationError('Dialogue must have at least 2 speakers');
		}

		// Validate messages
		if (!dialogue.messages || dialogue.messages.length < 2) {
			this.slide.addValidationError('Dialogue must have at least 2 messages');
		}

		if (dialogue.messages && dialogue.messages.length > 50) {
			this.slide.addValidationWarning('Dialogue has more than 50 messages - may be too long');
		}

		// Validate duration for Instagram Reels
		if (dialogue.duration > 90000) {
			this.slide.addValidationWarning(
				`Dialogue duration (${Math.round(dialogue.duration / 1000)}s) exceeds 90s Instagram limit`
			);
		}

		if (dialogue.duration < 5000) {
			this.slide.addValidationWarning(
				`Dialogue duration (${Math.round(dialogue.duration / 1000)}s) is very short`
			);
		}

		// Validate layout for Instagram
		if (this.slide.layout.dimensions) {
			const { width, height } = this.slide.layout.dimensions;
			const aspectRatio = width / height;
			const targetRatio = 1080 / 1350; // 0.8 (4:5)

			if (Math.abs(aspectRatio - targetRatio) > 0.01) {
				this.slide.addValidationWarning(
					`Slide aspect ratio (${aspectRatio.toFixed(2)}) differs from Instagram Reels optimal (0.8)`
				);
			}
		}
	}

	/**
	 * Quick builder method: create dialogue slide from DialogueContent
	 * @param {DialogueContent} dialogueContent - Dialogue content
	 * @param {Object} [options] - Additional options
	 * @returns {Slide}
	 */
	static buildFromDialogue(dialogueContent, options = {}) {
		const builder = new DialogueSlideBuilder();

		builder
			.setTitle(dialogueContent.title || 'Untitled Dialogue')
			.setContent(dialogueContent)
			.setLayout(options.layout || 'instagram-reels-portrait')
			.setStyle(options.style || {});

		// Add speakers as assets
		dialogueContent.speakers.forEach((speaker) => {
			builder.addSpeaker(speaker);
		});

		if (options.subtitle) {
			builder.setSubtitle(options.subtitle);
		}

		if (options.instagramMetadata) {
			builder.setInstagramMetadata(options.instagramMetadata);
		}

		if (options.tenantId) {
			builder.setTenantId(options.tenantId);
		}

		return builder.getResult();
	}
}
