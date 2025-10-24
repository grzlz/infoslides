import { SlideBuilder } from '../patterns/SlideBuilder.js';
import { DialogueContent } from '../models/dialogue/DialogueContent.js';
import { Speaker } from '../models/dialogue/Speaker.js';
import { Message } from '../models/dialogue/Message.js';
import { CodeBlock } from '../models/dialogue/CodeBlock.js';

/**
 * Concrete builder for dialogue-based slides (Kobe/Kanye conversations)
 * Handles speaker management, message sequencing, and code snippets
 */
export class DialogueSlideBuilder extends SlideBuilder {
	constructor() {
		super();
		this.dialogueContent = new DialogueContent();
	}

	/**
	 * Reset builder and dialogue content
	 * @returns {DialogueSlideBuilder}
	 */
	reset() {
		super.reset();
		this.dialogueContent = new DialogueContent();
		return this;
	}

	/**
	 * Set dialogue title
	 * @param {string} title - Dialogue title
	 * @returns {DialogueSlideBuilder}
	 */
	setTitle(title) {
		this.slide.title = title;
		this.slide.type = 'dialogue';
		this.dialogueContent.title = title;
		this.addBuildStep('setTitle', title);
		return this;
	}

	/**
	 * Set subtitle (optional, usually topic category)
	 * @param {string} subtitle - Subtitle text
	 * @returns {DialogueSlideBuilder}
	 */
	setSubtitle(subtitle) {
		this.slide.subtitle = subtitle;
		this.addBuildStep('setSubtitle', subtitle);
		return this;
	}

	/**
	 * Add a speaker to the dialogue
	 * @param {Speaker|Object} speaker - Speaker instance or data
	 * @returns {DialogueSlideBuilder}
	 */
	addSpeaker(speaker) {
		this.dialogueContent.addSpeaker(speaker);
		this.addBuildStep('addSpeaker', speaker instanceof Speaker ? speaker.name : speaker);
		return this;
	}

	/**
	 * Add Kobe Bryant as expert speaker
	 * @returns {DialogueSlideBuilder}
	 */
	addKobeBryant() {
		const kobe = Speaker.createKobeBryant();
		this.dialogueContent.addSpeaker(kobe);
		this.addBuildStep('addKobeBryant', 'Expert speaker added');
		return this;
	}

	/**
	 * Add Kanye West as novice speaker
	 * @returns {DialogueSlideBuilder}
	 */
	addKanyeWest() {
		const kanye = Speaker.createKanyeWest();
		this.dialogueContent.addSpeaker(kanye);
		this.addBuildStep('addKanyeWest', 'Novice speaker added');
		return this;
	}

	/**
	 * Add Kobe & Kanye speakers (shortcut)
	 * @returns {DialogueSlideBuilder}
	 */
	addKobeAndKanye() {
		this.addKobeBryant();
		this.addKanyeWest();
		return this;
	}

	/**
	 * Add a message to the dialogue
	 * @param {string} speakerName - Name of speaker
	 * @param {string} text - Message text
	 * @param {Object} [options={}] - Additional options (timestamp, order, animation)
	 * @returns {DialogueSlideBuilder}
	 */
	addMessage(speakerName, text, options = {}) {
		const speaker = this.dialogueContent.getSpeakerByName(speakerName);
		if (!speaker) {
			throw new Error(`Speaker "${speakerName}" not found. Add speaker first.`);
		}

		const message = new Message();
		message.speakerId = speaker.id;
		message.text = text;
		message.order = options.order ?? this.dialogueContent.messages.length;
		message.timestamp = options.timestamp ?? message.order * 2000; // Default: 2s per message
		message.isInterruption = options.isInterruption ?? false;

		if (options.animation) {
			message.setAnimation(options.animation.type, options.animation.duration, options.animation.delay);
		}

		this.dialogueContent.addMessage(message);
		this.addBuildStep('addMessage', { speaker: speakerName, preview: text.substring(0, 50) });
		return this;
	}

	/**
	 * Add a message with code block
	 * @param {string} speakerName - Name of speaker
	 * @param {string} text - Message text
	 * @param {string} code - Code content
	 * @param {Object} [options={}] - Additional options
	 * @returns {DialogueSlideBuilder}
	 */
	addMessageWithCode(speakerName, text, code, options = {}) {
		const speaker = this.dialogueContent.getSpeakerByName(speakerName);
		if (!speaker) {
			throw new Error(`Speaker "${speakerName}" not found. Add speaker first.`);
		}

		const message = new Message();
		message.speakerId = speaker.id;
		message.text = text;
		message.order = options.order ?? this.dialogueContent.messages.length;
		message.timestamp = options.timestamp ?? message.order * 2000;

		// Create code block
		const codeBlock = new CodeBlock();
		codeBlock.language = options.language || 'go';
		codeBlock.code = code;
		codeBlock.title = options.codeTitle || null;
		codeBlock.theme = options.codeTheme || 'monokai';
		codeBlock.updateLinesCount();

		message.attachCodeBlock(codeBlock);
		this.dialogueContent.addMessage(message);
		this.addBuildStep('addMessageWithCode', { speaker: speakerName, linesOfCode: codeBlock.metadata.linesCount });
		return this;
	}

	/**
	 * Set the dialogue content directly (from DialogueContent instance)
	 * @param {DialogueContent} content - DialogueContent instance
	 * @returns {DialogueSlideBuilder}
	 */
	setContent(content) {
		if (content instanceof DialogueContent) {
			this.dialogueContent = content;
			this.addBuildStep('setContent', 'DialogueContent set directly');
		} else {
			throw new Error('Content must be an instance of DialogueContent');
		}
		return this;
	}

	/**
	 * Set layout configuration
	 * @param {Object} layout - Layout options
	 * @returns {DialogueSlideBuilder}
	 */
	setLayout(layout) {
		this.slide.layout = {
			type: layout.type || 'dialogue',
			columns: 1, // Dialogue is always single column
			alignment: layout.alignment || 'center',
			spacing: layout.spacing || 'normal',
			bubbleStyle: layout.bubbleStyle || 'rounded', // rounded, square, cloud
			avatarPosition: layout.avatarPosition || 'side', // side, top, none
			showTimestamps: layout.showTimestamps ?? false
		};
		this.addBuildStep('setLayout', layout);
		return this;
	}

	/**
	 * Set style configuration
	 * @param {Object} style - Style options
	 * @returns {DialogueSlideBuilder}
	 */
	setStyle(style) {
		this.slide.style = {
			theme: style.theme || 'instagram',
			colors: style.colors || {},
			typography: {
				fontFamily: style.fontFamily || 'Inter, system-ui, sans-serif',
				fontSize: style.fontSize || '16px',
				lineHeight: style.lineHeight || 1.5
			},
			spacing: style.spacing || {},
			backgroundType: style.backgroundType || 'video', // video, solid, gradient
			backgroundColor: style.backgroundColor || '#000000'
		};
		this.addBuildStep('setStyle', { theme: style.theme });
		return this;
	}

	/**
	 * Finalize dialogue content and store in slide
	 * @returns {DialogueSlideBuilder}
	 */
	finalize() {
		// Calculate final duration
		this.dialogueContent.calculateDuration();

		// Store dialogue in slide content
		this.slide.content = {
			dialogueId: this.dialogueContent.id,
			dialogue: this.dialogueContent.toJSON(),
			speakers: this.dialogueContent.speakers.map(s => s.toJSON()),
			messages: this.dialogueContent.messages.map(m => m.toJSON()),
			duration: this.dialogueContent.duration,
			messageCount: this.dialogueContent.messages.length
		};

		this.addBuildStep('finalize', {
			duration: this.dialogueContent.duration,
			messageCount: this.dialogueContent.messages.length
		});
		return this;
	}

	/**
	 * Custom validation for dialogue slides
	 */
	customValidation() {
		// Validate dialogue content
		const dialogueValidation = this.dialogueContent.validate();

		if (!dialogueValidation.isValid) {
			dialogueValidation.errors.forEach(error => {
				this.slide.addValidationError(`Dialogue: ${error}`);
			});
		}

		dialogueValidation.warnings.forEach(warning => {
			this.slide.addValidationWarning(`Dialogue: ${warning}`);
		});

		// Check if dialogue was finalized
		if (!this.slide.content.dialogue) {
			this.slide.addValidationError('Dialogue content not finalized. Call finalize() before getResult()');
		}
	}

	/**
	 * Get the completed slide
	 * Automatically finalizes if not already done
	 * @returns {Slide}
	 */
	getResult() {
		// Auto-finalize if not done
		if (!this.slide.content.dialogue) {
			this.finalize();
		}

		return super.getResult();
	}
}
