<script>
	import { onMount } from 'svelte';

	let topics = $state([]);
	let selectedTopic = $state(null);
	let customTitle = $state('');
	let customDescription = $state('');
	let loading = $state(false);
	let result = $state(null);
	let error = $state(null);

	onMount(async () => {
		// Load sample topics
		try {
			const response = await fetch('/test-ai');
			const data = await response.json();
			topics = data.sampleTopics || [];
			if (topics.length > 0) {
				selectedTopic = topics[0];
			}
		} catch (err) {
			console.error('Failed to load sample topics:', err);
		}
	});

	async function generateDialogue() {
		loading = true;
		error = null;
		result = null;

		try {
			const topicData = customTitle
				? {
						title: customTitle,
						description: customDescription,
						category: 'custom',
						difficulty: 'beginner',
						keywords: ['go', 'golang']
					}
				: selectedTopic;

			const response = await fetch('/test-ai', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ topic: topicData })
			});

			const data = await response.json();

			if (data.success) {
				result = data.data;
			} else {
				error = data.error || 'Unknown error occurred';
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function selectTopic(topic) {
		selectedTopic = topic;
		customTitle = '';
		customDescription = '';
	}

	function formatDuration(ms) {
		return `${Math.round(ms / 1000)}s`;
	}

	function getSpeakerStyle(speakerName) {
		if (speakerName === 'KOBE BRYANT') {
			return 'background: #552583; color: #FDB927; font-weight: bold;';
		} else if (speakerName === 'KANYE WEST') {
			return 'background: #000000; color: #FFFFFF; font-weight: bold;';
		}
		return '';
	}
</script>

<div class="container">
	<h1>AI Dialogue Generator - Test Interface</h1>
	<p class="subtitle">Generate Kobe & Kanye dialogues for Go programming topics</p>

	<div class="generator-section">
		<div class="input-panel">
			<h2>Select Topic</h2>

			<div class="topic-select">
				{#each topics as topic}
					<button
						class="topic-btn"
						class:active={selectedTopic === topic && !customTitle}
						onclick={() => selectTopic(topic)}
					>
						<strong>{topic.title}</strong>
						<span class="difficulty">{topic.difficulty}</span>
					</button>
				{/each}
			</div>

			<h3>Or Create Custom Topic</h3>
			<input
				type="text"
				bind:value={customTitle}
				placeholder="Topic title (e.g., 'Defer Statement in Go')"
				class="input"
			/>
			<textarea
				bind:value={customDescription}
				placeholder="Topic description (optional)"
				rows="3"
				class="textarea"
			></textarea>

			<button class="generate-btn" onclick={generateDialogue} disabled={loading}>
				{loading ? '⏳ Generating...' : '✨ Generate Dialogue'}
			</button>
		</div>

		<div class="output-panel">
			<h2>Generated Dialogue</h2>

			{#if loading}
				<div class="loading">
					<div class="spinner"></div>
					<p>Calling Claude AI to generate dialogue...</p>
				</div>
			{/if}

			{#if error}
				<div class="error">
					<h3>Error</h3>
					<p>{error}</p>
				</div>
			{/if}

			{#if result}
				<div class="result">
					<div class="result-header">
						<h3>{result.topic.title}</h3>
						<div class="meta">
							<span>Duration: {formatDuration(result.dialogue.duration)}</span>
							<span>Messages: {result.dialogue.messages.length}</span>
							<span>Speakers: {result.dialogue.speakers.length}</span>
						</div>
					</div>

					{#if result.metadata.validation.warnings.length > 0}
						<div class="warnings">
							<strong>⚠ Warnings:</strong>
							<ul>
								{#each result.metadata.validation.warnings as warning}
									<li>{warning}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="dialogue">
						{#each result.dialogue.messages as message, index}
							{@const speaker = result.dialogue.speakers.find((s) => s.id === message.speakerId)}
							<div class="message" class:interruption={message.isInterruption}>
								<div class="message-header">
									<span class="speaker" style={getSpeakerStyle(speaker?.name)}>
										{speaker?.name || 'Unknown'}
									</span>
									<span class="timestamp">{formatDuration(message.timestamp)}</span>
									{#if message.isInterruption}
										<span class="badge">🔥 INTERRUPTION</span>
									{/if}
								</div>
								<div class="message-text">{message.text}</div>
								{#if message.codeBlock}
									<pre class="code-block"><code>{message.codeBlock.code}</code></pre>
								{/if}
							</div>
						{/each}
					</div>

					<details class="raw-data">
						<summary>View Raw JSON</summary>
						<pre>{JSON.stringify(result, null, 2)}</pre>
					</details>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #666;
		margin-bottom: 2rem;
	}

	.generator-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.input-panel,
	.output-panel {
		background: #f9f9f9;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.topic-select {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.topic-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border: 2px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.topic-btn:hover {
		border-color: #552583;
	}

	.topic-btn.active {
		background: #552583;
		color: #fdb927;
		border-color: #552583;
	}

	.difficulty {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #e0e0e0;
		border-radius: 4px;
	}

	.topic-btn.active .difficulty {
		background: #fdb927;
		color: #552583;
	}

	.input,
	.textarea {
		width: 100%;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border: 2px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
	}

	.generate-btn {
		width: 100%;
		padding: 1rem;
		font-size: 1.1rem;
		font-weight: bold;
		background: linear-gradient(135deg, #552583, #fdb927);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.generate-btn:hover:not(:disabled) {
		transform: scale(1.02);
	}

	.generate-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto 1rem;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #552583;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error {
		padding: 1rem;
		background: #fee;
		border: 2px solid #c33;
		border-radius: 4px;
		color: #c33;
	}

	.result-header {
		margin-bottom: 1.5rem;
	}

	.result-header h3 {
		margin-bottom: 0.5rem;
	}

	.meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #666;
	}

	.warnings {
		padding: 1rem;
		background: #fff3cd;
		border: 2px solid #ffc107;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.warnings ul {
		margin: 0.5rem 0 0 1.5rem;
	}

	.dialogue {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.message {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #ddd;
	}

	.message.interruption {
		border-left-color: #ff4444;
		background: #fff5f5;
	}

	.message-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.speaker {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.timestamp {
		font-size: 0.75rem;
		color: #999;
	}

	.badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #ff4444;
		color: white;
		border-radius: 4px;
	}

	.message-text {
		font-size: 1rem;
		line-height: 1.5;
	}

	.code-block {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #1e1e1e;
		color: #d4d4d4;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
	}

	.raw-data {
		margin-top: 1.5rem;
		padding: 1rem;
		background: white;
		border-radius: 4px;
	}

	.raw-data summary {
		cursor: pointer;
		font-weight: bold;
		color: #552583;
	}

	.raw-data pre {
		margin-top: 1rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.generator-section {
			grid-template-columns: 1fr;
		}
	}
</style>
