import { VoiceFactory } from './src/lib/factories/VoiceFactory.js';

/**
 * Test script for provider-agnostic API key detection
 * Tests the auto-detection logic without making actual API calls
 */

console.log('🔍 Testing Voice API Key Detection\n');

// Test cases
const testCases = [
	{
		name: 'OpenAI key (sk- prefix)',
		key: 'sk-1234567890abcdef1234567890abcdef',
		expected: 'openai'
	},
	{
		name: 'OpenAI key (sk-proj- prefix)',
		key: 'sk-proj-1234567890abcdef1234567890abcdef',
		expected: 'openai'
	},
	{
		name: 'ElevenLabs key (32 hex chars)',
		key: 'a1b2c3d4e5f67890a1b2c3d4e5f67890',
		expected: 'elevenlabs'
	},
	{
		name: 'ElevenLabs key (uppercase hex)',
		key: 'A1B2C3D4E5F67890A1B2C3D4E5F67890',
		expected: 'elevenlabs'
	},
	{
		name: 'Invalid key (too short)',
		key: 'invalid',
		expected: null
	},
	{
		name: 'Invalid key (wrong format)',
		key: 'api_key_1234567890',
		expected: null
	},
	{
		name: 'Empty key',
		key: '',
		expected: null
	},
	{
		name: 'Null key',
		key: null,
		expected: null
	}
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running detection tests:\n');

testCases.forEach((test, index) => {
	const result = VoiceFactory.detectProvider(test.key);
	const success = result === test.expected;

	if (success) {
		passed++;
		console.log(`✅ Test ${index + 1}: ${test.name}`);
		console.log(`   Input: "${test.key || '(empty)'}"`);
		console.log(`   Detected: ${result || 'null'}`);
	} else {
		failed++;
		console.log(`❌ Test ${index + 1}: ${test.name}`);
		console.log(`   Input: "${test.key || '(empty)'}"`);
		console.log(`   Expected: ${test.expected || 'null'}`);
		console.log(`   Got: ${result || 'null'}`);
	}
	console.log('');
});

// Summary
console.log('─'.repeat(50));
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
	console.log('🎉 All tests passed!\n');
	process.exit(0);
} else {
	console.log('⚠️  Some tests failed\n');
	process.exit(1);
}
