<script>
	import GlassContainer from './GlassContainer.svelte';

	/**
	 * DialogueBubble - Glass-styled dialogue bubble for Kobe & Kanye
	 */

	let {
		speaker = null,
		message = '',
		isInterruption = false,
		timestamp = 0,
		codeBlock = null,
		animated = false
	} = $props();

	// Speaker-specific glass styling
	const glassConfig = $derived.by(() => {
		if (!speaker) return {};

		if (speaker.name === 'KOBE BRYANT') {
			return {
				cornerRadius: '24px',
				baseStrength: '12px',
				extraBlur: '3px',
				softness: '10px',
				invert: '5%',
				brightness: 1.1,
				contrast: 1.2,
				// Lakers colors
				backgroundColor: 'rgba(85, 37, 131, 0.4)', // Purple with transparency
				textColor: '#FDB927' // Gold
			};
		} else if (speaker.name === 'KANYE WEST') {
			return {
				cornerRadius: isInterruption ? '28px' : '24px',
				baseStrength: isInterruption ? '16px' : '12px',
				extraBlur: isInterruption ? '4px' : '3px',
				softness: isInterruption ? '14px' : '10px',
				invert: '8%',
				brightness: 1.05,
				contrast: 1.3,
				// Bold black/white
				backgroundColor: 'rgba(0, 0, 0, 0.6)', // Black with transparency
				textColor: '#FFFFFF' // White
			};
		}

		return {};
	});

	function formatTimestamp(ms) {
		return `${Math.round(ms / 1000)}s`;
	}
</script>

<div class="bubble-wrapper" class:animated class:interruption={isInterruption}>
	<GlassContainer
		cornerRadius={glassConfig.cornerRadius}
		baseStrength={glassConfig.baseStrength}
		extraBlur={glassConfig.extraBlur}
		softness={glassConfig.softness}
		invert={glassConfig.invert}
		brightness={glassConfig.brightness}
		contrast={glassConfig.contrast}
	>
		<div class="bubble-content" style:background-color={glassConfig.backgroundColor}>
			<div class="bubble-header">
				<span class="speaker-name" style:color={glassConfig.textColor}>
					{speaker?.name || 'UNKNOWN'}
				</span>
				<span class="timestamp">{formatTimestamp(timestamp)}</span>
				{#if isInterruption}
					<span class="interruption-badge">🔥</span>
				{/if}
			</div>

			<div class="message-text" style:color={glassConfig.textColor}>
				{message}
			</div>

			{#if codeBlock}
				<pre class="code-block"><code>{codeBlock.code}</code></pre>
			{/if}
		</div>
	</GlassContainer>
</div>

<style>
	.bubble-wrapper {
		width: 100%;
		margin-bottom: 1rem;
		transform-origin: left center;
	}

	.bubble-wrapper.animated {
		animation: slideIn 0.4s ease-out;
	}

	.bubble-wrapper.interruption {
		animation: shake 0.3s ease-in-out, slideIn 0.4s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px) rotate(-1deg);
		}
		75% {
			transform: translateX(5px) rotate(1deg);
		}
	}

	.bubble-content {
		padding: 1.25rem 1.5rem;
		min-height: 60px;
		position: relative;
	}

	.bubble-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.speaker-name {
		font-weight: 900;
		font-size: 0.875rem;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.timestamp {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	.interruption-badge {
		margin-left: auto;
		font-size: 1.25rem;
		filter: drop-shadow(0 0 8px rgba(255, 68, 68, 0.8));
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}

	.message-text {
		font-size: 1.125rem;
		line-height: 1.6;
		font-weight: 600;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		letter-spacing: 0.3px;
	}

	.code-block {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 12px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow-x: auto;
	}

	.code-block code {
		font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
		font-size: 0.875rem;
		color: #d4d4d4;
		line-height: 1.5;
	}

	/* Mobile optimization for Instagram Reels */
	@media (max-width: 480px) {
		.bubble-content {
			padding: 1rem;
		}

		.message-text {
			font-size: 1rem;
		}

		.speaker-name {
			font-size: 0.75rem;
		}
	}
</style>
