# Testing Guide: Provider-Agnostic Voice Generation

This document covers testing strategies for the Infography Factory Engine's voice generation system, which uses a **Strategy + Factory pattern** to support multiple voice providers with a single, unified API.

## Overview: Provider-Agnostic Architecture

The voice system decouples provider implementation from usage through:

- **VoiceFactory**: Detects and instantiates the correct provider based on API key format or explicit selection
- **VoiceStrategy**: Abstract interface that all providers implement (OpenAI, ElevenLabs, etc.)
- **VoiceService**: Single provider-agnostic service that works with any strategy

This means **you write once, switch providers without changing code**.

---

## Part 1: Environment Setup

### Core Concept: One API Key, Any Provider

The system uses **`VOICE_API_KEY`** as the single provider-agnostic entry point. The factory automatically detects which provider matches the key format.

### Method 1: Provider-Agnostic Setup (Recommended)

Use a single `VOICE_API_KEY` environment variable. The factory auto-detects the provider:

```env
# OpenAI (keys start with 'sk-' or 'sk-proj-')
VOICE_API_KEY=sk-proj-your_openai_key_here

# ElevenLabs (32-character hexadecimal string)
VOICE_API_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

Optionally, explicitly specify the provider (useful if auto-detection fails):

```env
VOICE_API_KEY=sk-proj-your_key
VOICE_PROVIDER=openai
```

### Method 2: Provider-Specific Keys (Fallback)

If you prefer provider-specific environment variables, the factory falls back to them:

```env
# OpenAI specific
OPENAI_API_KEY=sk-proj-your_openai_key_here

# ElevenLabs specific
ELEVENLABS_API_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4

# Tell the system which one to use
VOICE_PROVIDER=openai
```

### Key Priority Order

1. Explicit `VOICE_PROVIDER` + `VOICE_API_KEY` (auto-detects provider)
2. Explicit `VOICE_PROVIDER` + provider-specific key (`OPENAI_API_KEY` or `ELEVENLABS_API_KEY`)
3. Auto-detect from `VOICE_API_KEY` format
4. Fallback to provider-specific keys if available
5. Default to OpenAI (if key is present)

---

## Part 2: Creating a Voice Service

The `VoiceService` class is your entry point for all voice operations. It works identically regardless of which provider is configured.

### Basic Setup

```javascript
import { VoiceService } from '$lib/services/VoiceService.js';

// Create from environment (auto-detects provider)
const voiceService = VoiceService.fromEnv();

// Verify configuration
const info = voiceService.getInfo();
console.log(info);
// Output: { provider: 'openai', hasApiKey: true }
```

### Switching Providers Programmatically

```javascript
// Use a specific provider
const elevenlabsService = VoiceService.withProvider('elevenlabs');
const openaiService = VoiceService.withProvider('openai');

// Both work identically - no API changes needed
```

### Checking Provider Status

```javascript
// Get detailed provider information
const providerInfo = VoiceService.getProviderInfo();
console.log(providerInfo);

// Output:
// {
//   configured: 'openai',
//   available: ['openai', 'elevenlabs', 'google', 'local'],
//   implemented: ['openai', 'elevenlabs'],
//   apiKeys: {
//     generic: { present: true, detectedProvider: 'openai' },
//     openai: true,
//     elevenlabs: false,
//     google: false
//   }
// }
```

---

## Part 3: Generating Audio

Once the service is created, generating audio is straightforward and provider-agnostic.

### Single Message Audio

```javascript
const voiceService = VoiceService.fromEnv();

// Create a speaker object
const speaker = {
  id: 'speaker-1',
  name: 'Alex',
  voiceProfile: {
    gender: 'male',
    age: '30s',
    tone: 'professional',
    // Optional: override provider for this speaker
    provider: 'elevenlabs'
  }
};

// Generate audio
try {
  const audio = await voiceService.generateMessageAudio(
    'Goroutines are lightweight threads managed by the Go runtime',
    speaker
  );

  console.log(audio);
  // Output:
  // {
  //   audioPath: 'audio/alex_message_1.mp3',
  //   duration: 4500,
  //   format: 'mp3',
  //   provider: 'openai',
  //   metadata: { ... }
  // }
} catch (error) {
  console.error('Audio generation failed:', error.message);
}
```

### Batch Dialogue Generation

```javascript
// Dialogue object with multiple messages and speakers
const dialogue = {
  messages: [
    {
      id: 'msg-1',
      speakerId: 'speaker-1',
      text: 'Goroutines are lightweight threads managed by the Go runtime',
      timestamp: 0
    },
    {
      id: 'msg-2',
      speakerId: 'speaker-2',
      text: 'Think of them as very cheap threads that the runtime can manage efficiently',
      timestamp: 4500
    }
  ],
  speakers: [
    {
      id: 'speaker-1',
      name: 'Alex',
      voiceProfile: { gender: 'male', tone: 'professional' }
    },
    {
      id: 'speaker-2',
      name: 'Jordan',
      voiceProfile: { gender: 'female', tone: 'casual' }
    }
  ],
  getSpeakerById(id) {
    return this.speakers.find(s => s.id === id);
  }
};

// Generate audio for entire dialogue
const voiceService = VoiceService.fromEnv();
const result = await voiceService.generateDialogueAudio(dialogue);

console.log(result);
// Output:
// {
//   audioFiles: [
//     {
//       messageId: 'msg-1',
//       messageIndex: 0,
//       speakerId: 'speaker-1',
//       speakerName: 'Alex',
//       text: '...',
//       audioPath: 'audio/alex_message_1.mp3',
//       duration: 4500,
//       format: 'mp3',
//       provider: 'openai'
//     },
//     // ...more messages
//   ],
//   errors: [],
//   summary: {
//     total: 2,
//     successful: 2,
//     failed: 0,
//     totalDuration: 9500,
//     provider: 'openai'
//   }
// }
```

---

## Part 4: Validating Configuration

### Pre-Check: Verify All Requirements

Run this before generating audio to catch configuration issues early:

```javascript
import { VoiceService } from '$lib/services/VoiceService.js';

try {
  // Create service (this validates the provider exists and has an API key)
  const voiceService = VoiceService.fromEnv();

  // Validate the provider is properly configured
  const validation = await voiceService.validate();

  if (validation.isValid) {
    console.log(`✅ Voice service ready (${validation.provider})`);
  } else {
    console.error(`❌ Configuration invalid: ${validation.errors.join(', ')}`);
  }
} catch (error) {
  console.error(`❌ Failed to initialize voice service: ${error.message}`);
}
```

### Check Provider Availability

Before committing to a provider, check if it has a valid API key:

```javascript
import { VoiceFactory } from '$lib/factories/VoiceFactory.js';

// Check specific provider
const openaiAvailable = VoiceFactory.isProviderAvailable('openai');
const elevenlabsAvailable = VoiceFactory.isProviderAvailable('elevenlabs');

console.log(`OpenAI available: ${openaiAvailable}`);
console.log(`ElevenLabs available: ${elevenlabsAvailable}`);
```

---

## Part 5: Testing Scenarios

### Scenario 1: Auto-Detection from VOICE_API_KEY

**Setup:**
```bash
VOICE_API_KEY=sk-proj-your_openai_key
# VOICE_PROVIDER not set
```

**Test:**
```javascript
const voiceService = VoiceService.fromEnv();
const info = voiceService.getInfo();
console.log(info.provider); // 'openai' (auto-detected)
```

**Expected Result:** Provider is automatically detected as 'openai' from key format.

---

### Scenario 2: Explicit Provider Override

**Setup:**
```bash
VOICE_API_KEY=sk-proj-your_openai_key
VOICE_PROVIDER=openai
```

**Test:**
```javascript
const voiceService = VoiceService.fromEnv();
const info = voiceService.getInfo();
console.log(info.provider); // 'openai'
```

**Expected Result:** Explicit provider selection takes precedence.

---

### Scenario 3: Fallback to Provider-Specific Key

**Setup:**
```bash
OPENAI_API_KEY=sk-proj-your_openai_key
VOICE_PROVIDER=openai
# VOICE_API_KEY not set
```

**Test:**
```javascript
const voiceService = VoiceService.fromEnv();
const info = voiceService.getInfo();
console.log(info.provider); // 'openai'
```

**Expected Result:** Falls back to `OPENAI_API_KEY` when `VOICE_API_KEY` is absent.

---

### Scenario 4: Mismatched Key Format

**Setup:**
```bash
VOICE_API_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4  # ElevenLabs format
VOICE_PROVIDER=openai  # But told to use OpenAI
```

**Test:**
```javascript
const voiceService = VoiceService.fromEnv();
// Throws error: "VOICE_API_KEY format doesn't match OpenAI"
```

**Expected Result:** Validation catches the mismatch and throws a helpful error.

---

### Scenario 5: Batch Generation with Multiple Providers

**Setup:**
```bash
VOICE_API_KEY=sk-proj-your_openai_key
# Also have ElevenLabs key available
ELEVENLABS_API_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

**Test:**
```javascript
// Use different providers for different speakers
const dialogue = {
  messages: [...],
  speakers: [
    {
      id: 'speaker-1',
      name: 'Alex',
      voiceProfile: {
        provider: 'openai'  // Use OpenAI for this speaker
      }
    },
    {
      id: 'speaker-2',
      name: 'Jordan',
      voiceProfile: {
        provider: 'elevenlabs'  // Use ElevenLabs for this speaker
      }
    }
  ],
  getSpeakerById(id) { return this.speakers.find(s => s.id === id); }
};

const voiceService = VoiceService.fromEnv();
const result = await voiceService.generateDialogueAudio(dialogue);
// Each speaker uses their configured provider
```

**Expected Result:** Messages are generated using the correct provider for each speaker.

---

## Part 6: Error Handling

### Missing API Key

**Error:**
```
No API key found for OpenAI voice generation.
Set one of:
  - VOICE_API_KEY (provider-agnostic, auto-detected)
  - OPENAI_API_KEY (provider-specific)

OpenAI keys start with 'sk-' or 'sk-proj-'
```

**Solution:**
- Set `VOICE_API_KEY=sk-proj-...` or `OPENAI_API_KEY=sk-proj-...`
- Check that the key is valid and has quota

---

### Unknown Provider Format

**Error:**
```
Could not auto-detect voice provider from VOICE_API_KEY format.
Expected formats:
  - OpenAI: Keys starting with 'sk-' or 'sk-proj-'
  - ElevenLabs: 32-character hexadecimal string

Either provide a valid key or set VOICE_PROVIDER explicitly
```

**Solution:**
- Either provide a valid key in the expected format
- Or explicitly set `VOICE_PROVIDER=openai` or `VOICE_PROVIDER=elevenlabs`

---

### Provider Not Implemented

**Error:**
```
Google TTS not implemented yet. Use VOICE_PROVIDER=openai or VOICE_PROVIDER=elevenlabs
```

**Solution:**
- Use one of the implemented providers (OpenAI or ElevenLabs)
- Or implement the provider by extending the `VoiceStrategy` class

---

## Part 7: Debugging

### Log Provider Detection

The factory logs which provider it detects:

```
[VoiceFactory] Auto-detected provider from VOICE_API_KEY: openai
[VoiceFactory] Creating voice provider: openai
```

### Log Audio Generation

The service logs each audio generation step:

```
[VoiceService] Generating audio for dialogue with 5 messages
[VoiceService] Generating audio for Alex via openai
[VoiceService] Text: "Goroutines are lightweight threads..."
[VoiceService] ✓ Generated: audio/alex_message_1.mp3
[VoiceService] ✓ Generated 5/5 audio files
```

### Check Available Providers

```javascript
import { VoiceFactory } from '$lib/factories/VoiceFactory.js';

console.log('Available:', VoiceFactory.getAvailableProviders());
// ['openai', 'elevenlabs', 'google', 'local']

console.log('Implemented:', VoiceFactory.getImplementedProviders());
// ['openai', 'elevenlabs']

const info = VoiceFactory.getProviderInfo();
console.log(JSON.stringify(info, null, 2));
```

---

## Part 8: Best Practices

### ✅ DO: Use VOICE_API_KEY for Provider Agnosticism

```javascript
// Good - works with any provider
const service = VoiceService.fromEnv();
```

### ✅ DO: Validate Before Generating Audio

```javascript
const service = VoiceService.fromEnv();
const validation = await service.validate();
if (!validation.isValid) {
  throw new Error(`Configuration error: ${validation.errors[0]}`);
}
```

### ✅ DO: Handle Partial Failures in Batch Generation

```javascript
const result = await voiceService.generateDialogueAudio(dialogue);

if (result.errors.length > 0) {
  console.warn(`${result.errors.length} messages failed to generate`);
  // Process successful files and log errors
}
```

### ❌ DON'T: Hardcode Provider Names

```javascript
// Bad - couples code to specific provider
if (provider === 'openai') {
  // do something
}
```

### ❌ DON'T: Assume All API Keys Are Present

```javascript
// Bad - ignores missing providers
const openaiService = VoiceService.withProvider('openai');
```

### ✅ DO: Check Provider Availability First

```javascript
if (VoiceFactory.isProviderAvailable('elevenlabs')) {
  const service = VoiceService.withProvider('elevenlabs');
} else {
  console.warn('ElevenLabs not configured, using default provider');
}
```

---

## Part 9: Architecture Reference

The voice system follows a **Strategy + Factory pattern**:

```
VoiceService (Provider-Agnostic Interface)
    ↓
VoiceFactory (Provider Detection & Instantiation)
    ↓
VoiceStrategy (Abstract Interface)
    ├── OpenAIVoice
    ├── ElevenLabsVoice
    └── Future Providers (Google, Local, etc.)
```

Each provider implements `VoiceStrategy`:

```javascript
interface VoiceStrategy {
  generateSpeech(text, voiceProfile) → Promise<{ audioPath, duration, format, metadata }>
  validateProvider() → Promise<boolean>
  getProviderName() → string
  formatError(error) → string
}
```

This design ensures:
- **New providers** can be added without changing existing code
- **VoiceService** works identically regardless of provider
- **Configuration** drives provider selection, not hardcoded logic

---

## Summary

The voice generation system is designed to be **provider-agnostic from day one**:

1. Set `VOICE_API_KEY` with your provider's key
2. Create `VoiceService.fromEnv()`
3. Generate audio using the unified API
4. Switch providers by changing one environment variable

No code changes required. No provider-specific conditionals. One API, infinite providers.
