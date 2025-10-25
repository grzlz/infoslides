/**
 * Test AI Content Generation
 *
 * Simple script to test the Kobe & Kanye dialogue generation pipeline
 *
 * Usage:
 *   1. Copy .env.example to .env and add your ANTHROPIC_API_KEY
 *   2. Run: node test-ai-generation.js
 */

import 'dotenv/config';
import { ContentPipeline } from './src/lib/services/ContentPipeline.js';
import { Topic } from './src/lib/models/instagram/Topic.js';

async function testAIGeneration() {
	console.log('=== Testing AI Content Generation ===\n');

	// Check for API key
	if (!process.env.ANTHROPIC_API_KEY) {
		console.error('❌ Error: ANTHROPIC_API_KEY not found in environment');
		console.log('\nSetup instructions:');
		console.log('1. Copy .env.example to .env');
		console.log('2. Add your API key: ANTHROPIC_API_KEY=your_key_here');
		console.log('3. Get a key from: https://console.anthropic.com/');
		process.exit(1);
	}

	try {
		// Step 1: Create a test topic
		console.log('📝 Creating test topic...');
		const topic = new Topic();
		topic.title = 'Goroutines Basics';
		topic.description = 'Learn how to use goroutines for concurrent programming in Go';
		topic.difficulty = 'beginner';
		topic.category = 'concurrency';
		topic.addKeyword('goroutines');
		topic.addKeyword('concurrency');
		topic.addKeyword('go keyword');
		topic.addLearningObjective('Understand what goroutines are', 'concept');
		topic.addLearningObjective('Know when to use goroutines', 'pattern');
		topic.scheduleForDay(1);

		console.log(`✓ Topic created: "${topic.title}"\n`);

		// Step 2: Create pipeline from environment
		console.log('🚀 Initializing ContentPipeline with AI service...');
		const pipeline = ContentPipeline.fromEnv();
		console.log('✓ Pipeline ready\n');

		// Step 3: Generate dialogue content
		console.log('🤖 Generating Kobe & Kanye dialogue via Claude AI...');
		console.log('   (This may take 5-10 seconds)\n');

		const result = await pipeline.generateDialogueContent({
			topic,
			reviewMode: true
		});

		// Step 4: Display results
		console.log('\n=== Generation Results ===\n');
		console.log('✓ SUCCESS!\n');

		console.log(`Topic: ${result.topic.title}`);
		console.log(`Difficulty: ${result.topic.difficulty}`);
		console.log(`Duration: ${Math.round(result.metadata.duration / 1000)}s`);
		console.log(`Messages: ${result.metadata.messageCount}`);
		console.log(`Speakers: ${result.metadata.speakerCount}`);
		console.log(`Generated: ${result.metadata.generatedAt}\n`);

		// Display the dialogue
		console.log('--- Generated Dialogue ---\n');
		result.dialogue.messages.forEach((msg, i) => {
			const speaker = result.dialogue.speakers.find(s => s.id === msg.speakerId);
			const speakerName = speaker.name.toUpperCase();
			const interruption = msg.isInterruption ? ' [INTERRUPTION]' : '';
			const timestamp = `[${(msg.timestamp / 1000).toFixed(1)}s]`;

			console.log(`${timestamp} ${speakerName}${interruption}:`);
			console.log(`  "${msg.text}"`);

			if (msg.codeBlock) {
				console.log(`  [CODE BLOCK - ${msg.codeBlock.language}]:`);
				console.log(`  ${msg.codeBlock.code.split('\n').join('\n  ')}`);
			}

			console.log('');
		});

		// Validation info
		console.log('--- Validation ---\n');
		if (result.metadata.validation.isValid) {
			console.log('✓ Slide is valid and ready to render');
		} else {
			console.log('⚠️ Validation errors:', result.metadata.validation.errors);
		}

		if (result.metadata.validation.warnings.length > 0) {
			console.log('⚠️ Warnings:', result.metadata.validation.warnings);
		}

		console.log('\n=== Test Complete ===');

	} catch (error) {
		console.error('\n❌ Error during generation:');
		console.error(error.message);
		console.error('\nStack trace:');
		console.error(error.stack);
		process.exit(1);
	}
}

// Run the test
testAIGeneration();
