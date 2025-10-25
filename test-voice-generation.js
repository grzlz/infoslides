import 'dotenv/config';
import { ContentPipeline } from './src/lib/services/ContentPipeline.js';
import { Topic } from './src/lib/models/instagram/Topic.js';
import { VoiceService } from './src/lib/services/VoiceService.js';

/**
 * Test script for voice generation
 * Tests the complete pipeline: AI dialogue + voice generation
 *
 * Usage:
 *   node test-voice-generation.js
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY - For dialogue generation
 *   OPENAI_API_KEY or ELEVENLABS_API_KEY - For voice generation
 *   VOICE_PROVIDER - 'openai' or 'elevenlabs' (defaults to 'openai')
 */

async function main() {
	console.log('🎙️  Voice Generation Test\n');

	// Check provider configuration
	console.log('📋 Provider Configuration:');
	const providerInfo = VoiceService.getProviderInfo();
	console.log(`   Configured: ${providerInfo.configured}`);
	console.log(`   API Keys: ${JSON.stringify(providerInfo.apiKeys, null, 2)}`);

	if (!providerInfo.apiKeys[providerInfo.configured]) {
		console.error(
			`\n❌ Error: No API key found for provider '${providerInfo.configured}'`
		);
		console.error(`   Set ${providerInfo.configured.toUpperCase()}_API_KEY in your .env file`);
		process.exit(1);
	}

	console.log('\n✅ Provider configured correctly\n');

	// Create a test topic
	const topic = new Topic();
	topic.title = 'Goroutines Basics';
	topic.description = 'Learn how Go\'s lightweight concurrency model works';
	topic.category = 'concurrency';
	topic.difficulty = 'intermediate';
	topic.keywords = ['goroutines', 'concurrency', 'go', 'async'];
	topic.addLearningObjective('Understand what goroutines are');
	topic.addLearningObjective('Learn how to spawn goroutines');
	topic.scheduleForDay(1);

	console.log(`📝 Testing with topic: "${topic.title}"\n`);

	try {
		// Generate dialogue + voice
		console.log('🤖 Step 1: Generating AI dialogue...');
		const pipeline = ContentPipeline.fromEnv();
		const result = await pipeline.generateDialogueContent({
			topic,
			reviewMode: true,
			enableVoice: true // ← ENABLE VOICE GENERATION
		});

		console.log('\n✅ Generation Complete!\n');

		// Display results
		console.log('📊 Results:');
		console.log(`   Dialogue Messages: ${result.dialogue.messages.length}`);
		console.log(`   Dialogue Duration: ${Math.round(result.dialogue.duration / 1000)}s`);
		console.log(`   Speakers: ${result.dialogue.speakers.map((s) => s.name).join(', ')}`);

		if (result.voice) {
			console.log(`\n🎙️  Voice Generation:`);
			console.log(
				`   Provider: ${result.voice.summary.provider}`
			);
			console.log(
				`   Audio Files: ${result.voice.summary.successful}/${result.voice.summary.total}`
			);
			console.log(
				`   Total Duration: ${Math.round(result.voice.summary.totalDuration / 1000)}s`
			);

			if (result.voice.audioFiles.length > 0) {
				console.log('\n📂 Generated Audio Files:');
				result.voice.audioFiles.forEach((audio, index) => {
					console.log(
						`   ${index + 1}. ${audio.speakerName}: ${audio.audioPath}`
					);
					console.log(`      Text: "${audio.text.substring(0, 60)}${audio.text.length > 60 ? '...' : ''}"`);
					console.log(`      Duration: ${Math.round(audio.duration / 1000)}s`);
				});
			}

			if (result.voice.errors.length > 0) {
				console.log('\n⚠️  Errors:');
				result.voice.errors.forEach((err, index) => {
					console.log(`   ${index + 1}. Message ${err.messageIndex}: ${err.error}`);
				});
			}
		} else {
			console.log('\n⚠️  No voice audio generated (enableVoice was false or generation failed)');
		}

		// Display validation
		console.log('\n✅ Validation:');
		console.log(`   Slide Valid: ${result.metadata.validation.isValid}`);
		if (result.metadata.validation.errors.length > 0) {
			console.log(`   Errors: ${result.metadata.validation.errors.join(', ')}`);
		}
		if (result.metadata.validation.warnings.length > 0) {
			console.log(`   Warnings: ${result.metadata.validation.warnings.join(', ')}`);
		}

		console.log('\n🎉 Test completed successfully!\n');
	} catch (error) {
		console.error('\n❌ Error during generation:', error.message);
		if (error.stack) {
			console.error('\nStack trace:');
			console.error(error.stack);
		}
		process.exit(1);
	}
}

main();
