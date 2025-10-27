import { VoiceFactory } from './src/lib/factories/VoiceFactory.js';

/**
 * Test script for error messages
 * Demonstrates clear error messages for common misconfiguration scenarios
 */

console.log('🚨 Testing Error Messages for Misconfiguration\n');
console.log('─'.repeat(60));

// Test 1: Invalid VOICE_API_KEY format
console.log('\n📝 Test 1: Invalid VOICE_API_KEY format (auto-detection fails)\n');
const originalEnv = { ...process.env };
process.env.VOICE_API_KEY = 'invalid_key_format_xyz123';
delete process.env.VOICE_PROVIDER;
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;

try {
	VoiceFactory.createFromEnv();
	console.log('❌ Should have thrown an error');
} catch (error) {
	console.log('✅ Caught expected error:\n');
	console.log(error.message);
}

// Test 2: No API key configured at all
console.log('\n─'.repeat(60));
console.log('\n📝 Test 2: No API key configured (trying to create OpenAI)\n');
delete process.env.VOICE_API_KEY;
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;
process.env.VOICE_PROVIDER = 'openai';

try {
	VoiceFactory.createFromEnv();
	console.log('❌ Should have thrown an error');
} catch (error) {
	console.log('✅ Caught expected error:\n');
	console.log(error.message);
}

// Test 3: Wrong provider for VOICE_API_KEY format
console.log('\n─'.repeat(60));
console.log('\n📝 Test 3: VOICE_API_KEY has OpenAI format but provider set to ElevenLabs\n');
process.env.VOICE_API_KEY = 'sk-1234567890abcdef';
process.env.VOICE_PROVIDER = 'elevenlabs';
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;

try {
	VoiceFactory.createFromEnv();
	console.log('❌ Should have thrown an error');
} catch (error) {
	console.log('✅ Caught expected error:\n');
	console.log(error.message);
}

// Test 4: VOICE_API_KEY has ElevenLabs format but provider set to OpenAI
console.log('\n─'.repeat(60));
console.log('\n📝 Test 4: VOICE_API_KEY has ElevenLabs format but provider set to OpenAI\n');
process.env.VOICE_API_KEY = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
process.env.VOICE_PROVIDER = 'openai';
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;

try {
	VoiceFactory.createFromEnv();
	console.log('❌ Should have thrown an error');
} catch (error) {
	console.log('✅ Caught expected error:\n');
	console.log(error.message);
}

// Test 5: Valid VOICE_API_KEY with auto-detection (success case)
console.log('\n─'.repeat(60));
console.log('\n📝 Test 5: Valid VOICE_API_KEY with auto-detection (OpenAI)\n');
process.env.VOICE_API_KEY = 'sk-proj-test1234567890';
delete process.env.VOICE_PROVIDER;
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;

try {
	const provider = VoiceFactory.createFromEnv();
	console.log('✅ Successfully created provider:\n');
	console.log(`   Provider: ${provider.getProviderName()}`);
	console.log(`   Auto-detected from VOICE_API_KEY format`);
} catch (error) {
	console.log('❌ Unexpected error:', error.message);
}

// Test 6: Valid VOICE_API_KEY with auto-detection (ElevenLabs)
console.log('\n─'.repeat(60));
console.log('\n📝 Test 6: Valid VOICE_API_KEY with auto-detection (ElevenLabs)\n');
process.env.VOICE_API_KEY = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
delete process.env.VOICE_PROVIDER;
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;

try {
	const provider = VoiceFactory.createFromEnv();
	console.log('✅ Successfully created provider:\n');
	console.log(`   Provider: ${provider.getProviderName()}`);
	console.log(`   Auto-detected from VOICE_API_KEY format`);
} catch (error) {
	console.log('❌ Unexpected error:', error.message);
}

// Test 7: Backward compatibility - provider-specific keys still work
console.log('\n─'.repeat(60));
console.log('\n📝 Test 7: Backward compatibility (OPENAI_API_KEY still works)\n');
delete process.env.VOICE_API_KEY;
process.env.OPENAI_API_KEY = 'sk-legacy-key-12345';
process.env.VOICE_PROVIDER = 'openai';
delete process.env.ELEVENLABS_API_KEY;

try {
	const provider = VoiceFactory.createFromEnv();
	console.log('✅ Successfully created provider:\n');
	console.log(`   Provider: ${provider.getProviderName()}`);
	console.log(`   Using legacy OPENAI_API_KEY (backward compatible)`);
} catch (error) {
	console.log('❌ Unexpected error:', error.message);
}

// Test 8: Priority order - VOICE_API_KEY takes precedence
console.log('\n─'.repeat(60));
console.log('\n📝 Test 8: Priority order (VOICE_API_KEY overrides provider-specific)\n');
process.env.VOICE_API_KEY = 'sk-generic-key-12345';
process.env.OPENAI_API_KEY = 'sk-specific-key-67890';
process.env.VOICE_PROVIDER = 'openai';
delete process.env.ELEVENLABS_API_KEY;

try {
	const provider = VoiceFactory.createFromEnv();
	console.log('✅ Successfully created provider:\n');
	console.log(`   Provider: ${provider.getProviderName()}`);
	console.log(`   Used VOICE_API_KEY (priority over OPENAI_API_KEY)`);
} catch (error) {
	console.log('❌ Unexpected error:', error.message);
}

// Restore environment
Object.assign(process.env, originalEnv);

console.log('\n─'.repeat(60));
console.log('\n🎉 All error message tests completed!\n');
