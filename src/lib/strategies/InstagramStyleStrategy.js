import { StyleStrategy } from './StyleStrategy.js';

/**
 * Instagram Reels styling strategy optimized for mobile viewing
 * High contrast, large text, celebrity dialogue format (Kobe/Kanye)
 */
export class InstagramStyleStrategy extends StyleStrategy {
	constructor(options = {}) {
		super();
		this.aspectRatio = options.aspectRatio || '4:5'; // Instagram Reels default
		this.enableAnimations = options.enableAnimations ?? true;
		this.codeTheme = options.codeTheme || 'monokai';
	}

	/**
	 * Get complete style configuration
	 * @returns {Object}
	 */
	getStyles() {
		return {
			// Dimensions
			dimensions: this.getDimensions(),

			// Colors
			...this.getColorScheme(),

			// Typography
			...this.getTypography(),

			// Layout
			layout: {
				bubbleStyle: 'rounded',
				bubbleMaxWidth: '85%', // Don't span full width
				bubblePadding: '16px 20px',
				bubbleMargin: '12px',
				avatarSize: '48px',
				avatarPosition: 'side', // left or right based on speaker
				spacing: 'comfortable'
			},

			// Speaker-specific styles
			speakers: this.getSpeakerStyles(),

			// Code block styling
			codeBlock: this.getCodeBlockStyles(),

			// Animations
			animations: this.enableAnimations ? this.getAnimations() : {},

			// Instagram-specific
			instagram: {
				format: 'reels',
				aspectRatio: this.aspectRatio,
				safeArea: {
					top: 120, // Account for Instagram UI
					bottom: 180 // Account for captions/actions
				}
			}
		};
	}

	/**
	 * Get video dimensions based on aspect ratio
	 * @returns {Object}
	 */
	getDimensions() {
		const dimensions = {
			'1:1': { width: 1080, height: 1080 },
			'4:5': { width: 1080, height: 1350 },
			'9:16': { width: 1080, height: 1920 }
		};

		return dimensions[this.aspectRatio] || dimensions['4:5'];
	}

	/**
	 * Get color scheme optimized for mobile
	 * @returns {Object}
	 */
	getColorScheme() {
		return {
			// Background (typically video)
			background: 'rgba(0, 0, 0, 0)', // Transparent for video overlay
			backgroundFallback: '#000000',

			// Text colors (high contrast)
			textPrimary: '#FFFFFF',
			textSecondary: '#E0E0E0',
			textMuted: '#999999',

			// Dialogue bubbles
			bubbleBackground: 'rgba(0, 0, 0, 0.85)', // Semi-transparent
			bubbleBorder: 'rgba(255, 255, 255, 0.2)',

			// Accent colors
			accentPrimary: '#FF0055', // Instagram-like red/pink
			accentSecondary: '#00D9FF', // Cyan

			// Code highlighting
			codeBg: 'rgba(30, 30, 30, 0.95)',
			codeText: '#ABB2BF',
			codeKeyword: '#C678DD',
			codeString: '#98C379',
			codeComment: '#5C6370'
		};
	}

	/**
	 * Get typography optimized for mobile readability
	 * @returns {Object}
	 */
	getTypography() {
		return {
			// Font families
			headingFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			bodyFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			codeFont: 'Fira Code, JetBrains Mono, Consolas, monospace',

			// Font sizes (mobile-first, large for readability)
			fontSize: {
				title: '28px',
				subtitle: '18px',
				dialogue: '18px',
				speaker: '14px',
				code: '15px',
				timestamp: '12px'
			},

			// Font weights
			fontWeights: {
				light: 300,
				normal: 400,
				medium: 500,
				semibold: 600,
				bold: 700,
				black: 900
			},

			// Line heights
			lineHeight: {
				tight: 1.2,
				normal: 1.5,
				relaxed: 1.7
			},

			// Letter spacing
			letterSpacing: {
				tight: '-0.02em',
				normal: '0em',
				wide: '0.05em'
			}
		};
	}

	/**
	 * Get speaker-specific styles (Kobe/Kanye)
	 * @returns {Object}
	 */
	getSpeakerStyles() {
		return {
			'KOBE BRYANT': {
				bubbleColor: 'rgba(85, 37, 131, 0.95)', // Lakers purple
				textColor: '#FDB927', // Lakers gold
				accentColor: '#FDB927',
				fontWeight: 600,
				fontFamily: 'Inter, sans-serif',
				avatarPosition: 'left',
				borderColor: '#FDB927'
			},
			'KANYE WEST': {
				bubbleColor: 'rgba(0, 0, 0, 0.95)', // Black
				textColor: '#FFFFFF', // White
				accentColor: '#FF0055',
				fontWeight: 700,
				fontFamily: 'Impact, "Arial Black", sans-serif',
				avatarPosition: 'right',
				borderColor: '#FFFFFF',
				textTransform: 'uppercase' // ALL CAPS for Kanye
			}
		};
	}

	/**
	 * Get code block styling
	 * @returns {Object}
	 */
	getCodeBlockStyles() {
		return {
			theme: this.codeTheme,
			backgroundColor: 'rgba(30, 30, 30, 0.95)',
			borderRadius: '12px',
			padding: '16px',
			fontSize: '15px',
			lineHeight: 1.6,
			fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
			maxHeight: '400px',
			overflow: 'auto',
			showLineNumbers: true,
			lineNumberColor: '#5C6370',
			syntaxColors: {
				keyword: '#C678DD',
				string: '#98C379',
				number: '#D19A66',
				comment: '#5C6370',
				function: '#61AFEF',
				variable: '#E06C75'
			}
		};
	}

	/**
	 * Get animation configurations
	 * @returns {Object}
	 */
	getAnimations() {
		return {
			// Message entrance animations
			messageEntrance: {
				type: 'fade-slide',
				duration: 400,
				easing: 'ease-out',
				delay: 200 // Stagger between messages
			},

			// Code typing effect
			codeTyping: {
				enabled: true,
				speed: 50, // ms per character
				highlightAsType: true
			},

			// Speaker avatar
			avatarPulse: {
				enabled: true,
				duration: 600,
				scale: 1.1
			},

			// Interruption effect (Kanye interrupting Kobe)
			interruption: {
				type: 'shake',
				duration: 300,
				intensity: 5
			}
		};
	}

	/**
	 * Get style overrides for specific dialogue types
	 * @param {string} dialogueType - Type of dialogue ('intro', 'technical', 'debate', etc.)
	 * @returns {Object}
	 */
	getDialogueTypeStyles(dialogueType) {
		const overrides = {
			intro: {
				fontSize: { dialogue: '20px' },
				layout: { bubbleMaxWidth: '90%' }
			},
			technical: {
				codeBlock: { maxHeight: '500px' },
				fontSize: { code: '16px' }
			},
			debate: {
				animations: { interruption: { intensity: 8 } },
				layout: { bubbleMargin: '8px' } // Faster pace
			},
			conclusion: {
				fontSize: { dialogue: '22px' },
				fontWeights: { dialogue: 700 }
			}
		};

		return overrides[dialogueType] || {};
	}

	/**
	 * Validate styles for Instagram requirements
	 * @returns {{isValid: boolean, warnings: string[]}}
	 */
	validateForInstagram() {
		const warnings = [];
		const dimensions = this.getDimensions();

		// Check dimensions
		if (dimensions.width < 1080 || dimensions.height < 1080) {
			warnings.push('Dimensions below Instagram minimum (1080px)');
		}

		// Check text sizing for mobile
		const fontSize = this.getTypography().fontSize;
		if (parseInt(fontSize.dialogue) < 16) {
			warnings.push('Dialogue text size may be too small for mobile viewing');
		}

		// Check contrast
		const colors = this.getColorScheme();
		if (!colors.bubbleBackground.includes('rgba')) {
			warnings.push('Consider using semi-transparent bubbles for video overlay');
		}

		return {
			isValid: warnings.length === 0,
			warnings
		};
	}

	/**
	 * Get styles as CSS variables (for Svelte components)
	 * @returns {Object}
	 */
	getAsCSSVariables() {
		const styles = this.getStyles();
		const colors = this.getColorScheme();
		const typography = this.getTypography();

		return {
			'--bg-primary': colors.background,
			'--bg-fallback': colors.backgroundFallback,
			'--text-primary': colors.textPrimary,
			'--text-secondary': colors.textSecondary,
			'--bubble-bg': colors.bubbleBackground,
			'--accent-primary': colors.accentPrimary,
			'--font-heading': typography.headingFont,
			'--font-body': typography.bodyFont,
			'--font-code': typography.codeFont,
			'--size-title': typography.fontSize.title,
			'--size-dialogue': typography.fontSize.dialogue,
			'--size-code': typography.fontSize.code,
			'--bubble-padding': styles.layout.bubblePadding,
			'--bubble-radius': styles.layout.bubbleStyle === 'rounded' ? '20px' : '4px'
		};
	}
}
