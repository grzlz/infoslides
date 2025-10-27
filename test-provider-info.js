import { VoiceFactory } from './src/lib/factories/VoiceFactory.js';

/**
 * Test script for provider info reporting
 * Demonstrates how the factory reports API key status
 */

console.log('📊 Testing Provider Info Reporting\n');
console.log('─'.repeat(60));

// Test 1: VOICE_API_KEY with OpenAI format
console.log('\n📝 Test 1: VOICE_API_KEY with OpenAI format\n');
const originalEnv = { ...process.env };
process.env.VOICE_API_KEY = 'sk-1234567890abcdef';
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;
delete process.env.VOICE_PROVIDER;

let info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Test 2: VOICE_API_KEY with ElevenLabs format
console.log('\n─'.repeat(60));
console.log('\n📝 Test 2: VOICE_API_KEY with ElevenLabs format\n');
process.env.VOICE_API_KEY = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;
delete process.env.VOICE_PROVIDER;

info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Test 3: Both generic and specific keys set
console.log('\n─'.repeat(60));
console.log('\n📝 Test 3: Both VOICE_API_KEY and provider-specific keys\n');
process.env.VOICE_API_KEY = 'sk-generic-123';
process.env.OPENAI_API_KEY = 'sk-specific-456';
process.env.ELEVENLABS_API_KEY = 'abcd1234efgh5678abcd1234efgh5678';
process.env.VOICE_PROVIDER = 'openai';

info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Test 4: Only provider-specific keys (backward compatibility)
console.log('\n─'.repeat(60));
console.log('\n📝 Test 4: Only provider-specific keys (legacy mode)\n');
delete process.env.VOICE_API_KEY;
process.env.OPENAI_API_KEY = 'sk-legacy-123';
process.env.ELEVENLABS_API_KEY = 'legacy1234567890legacy1234567890';
process.env.VOICE_PROVIDER = 'elevenlabs';

info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Test 5: Invalid VOICE_API_KEY format
console.log('\n─'.repeat(60));
console.log('\n📝 Test 5: Invalid VOICE_API_KEY format\n');
process.env.VOICE_API_KEY = 'invalid_format_xyz123';
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;
delete process.env.VOICE_PROVIDER;

info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Test 6: No keys configured
console.log('\n─'.repeat(60));
console.log('\n📝 Test 6: No API keys configured\n');
delete process.env.VOICE_API_KEY;
delete process.env.OPENAI_API_KEY;
delete process.env.ELEVENLABS_API_KEY;
process.env.VOICE_PROVIDER = 'openai';

info = VoiceFactory.getProviderInfo();
console.log('Provider Info:');
console.log(JSON.stringify(info, null, 2));

console.log('\nAvailability Checks:');
console.log(`  isProviderAvailable('openai'): ${VoiceFactory.isProviderAvailable('openai')}`);
console.log(`  isProviderAvailable('elevenlabs'): ${VoiceFactory.isProviderAvailable('elevenlabs')}`);

// Restore environment
Object.assign(process.env, originalEnv);

console.log('\n─'.repeat(60));
console.log('\n🎉 Provider info tests completed!\n');
