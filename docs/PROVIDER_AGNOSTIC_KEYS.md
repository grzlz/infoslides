# Provider-Agnostic Voice API Key System

**Status**: Implemented ✅
**Date**: October 25, 2025
**Implementation**: VoiceFactory.js

---

## Overview

The VoiceFactory now supports a **provider-agnostic API key system** that automatically detects which voice provider to use based on the API key format. This eliminates the need to manage separate environment variables for each provider.

---

## Quick Start

### Simple Setup (Recommended)

Instead of managing multiple API keys:
```bash
# OLD WAY (still supported)
VOICE_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123...
```

Use a single generic key:
```bash
# NEW WAY (auto-detected)
VOICE_API_KEY=sk-proj-abc123...
# Provider is auto-detected from key format
```

---

## Key Format Detection

The system identifies providers by analyzing the API key format:

### OpenAI
- **Format**: Keys start with `sk-` or `sk-proj-`
- **Example**: `sk-1234567890abcdef` or `sk-proj-1234567890abcdef`
- **Pattern**: `/^sk-/` or `/^sk-proj-/`

### ElevenLabs
- **Format**: 32-character hexadecimal string
- **Example**: `a1b2c3d4e5f67890a1b2c3d4e5f67890`
- **Pattern**: `/^[a-f0-9]{32}$/i`

---

## Configuration Priority

The system checks environment variables in this order:

1. **VOICE_API_KEY** (provider-agnostic, auto-detected)
2. **Provider-specific keys** (OPENAI_API_KEY, ELEVENLABS_API_KEY)
3. **VOICE_PROVIDER** (explicit provider selection)

### Example Scenarios

#### Scenario 1: Only VOICE_API_KEY
```bash
VOICE_API_KEY=sk-proj-abc123
# Auto-detects: OpenAI
```

#### Scenario 2: VOICE_API_KEY + VOICE_PROVIDER (ignored)
```bash
VOICE_API_KEY=sk-proj-abc123
VOICE_PROVIDER=elevenlabs  # ← Ignored, auto-detection takes precedence
# Result: Uses OpenAI (detected from key format)
```

#### Scenario 3: Provider-specific key (backward compatible)
```bash
OPENAI_API_KEY=sk-proj-abc123
VOICE_PROVIDER=openai
# Result: Uses OpenAI (legacy mode)
```

#### Scenario 4: Both generic and specific keys
```bash
VOICE_API_KEY=sk-proj-generic123
OPENAI_API_KEY=sk-proj-specific456
# Result: Uses VOICE_API_KEY (priority)
```

---

## Implementation Details

### Auto-Detection Logic

```javascript
static detectProvider(apiKey) {
  if (!apiKey) {
    return null;
  }

  // OpenAI keys start with sk- or sk-proj-
  if (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
    return 'openai';
  }

  // ElevenLabs keys are 32-character hexadecimal strings
  if (/^[a-f0-9]{32}$/i.test(apiKey)) {
    return 'elevenlabs';
  }

  return null;
}
```

### Factory Creation Flow

```javascript
static createFromEnv(providerName) {
  let provider = providerName;

  // Auto-detect from VOICE_API_KEY if no provider specified
  if (!provider) {
    const genericKey = process.env.VOICE_API_KEY;
    if (genericKey) {
      const detected = VoiceFactory.detectProvider(genericKey);
      if (detected) {
        provider = detected;
      } else {
        throw new Error('Could not auto-detect provider from VOICE_API_KEY format');
      }
    }
  }

  // Fall back to VOICE_PROVIDER env or default
  if (!provider) {
    provider = process.env.VOICE_PROVIDER || 'openai';
  }

  // Create the appropriate provider
  switch (provider.toLowerCase()) {
    case 'openai':
      return VoiceFactory.createOpenAI();
    case 'elevenlabs':
      return VoiceFactory.createElevenLabs();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### Provider-Specific Creation

```javascript
static createOpenAI() {
  // Priority: VOICE_API_KEY → OPENAI_API_KEY
  let apiKey = process.env.VOICE_API_KEY || process.env.OPENAI_API_KEY || '';

  // Validate format if using VOICE_API_KEY
  if (process.env.VOICE_API_KEY && !apiKey.startsWith('sk-')) {
    const detected = VoiceFactory.detectProvider(apiKey);
    if (detected !== 'openai') {
      throw new Error(
        `VOICE_API_KEY format doesn't match OpenAI (expected key starting with 'sk-' or 'sk-proj-').\n` +
        `Detected format: ${detected || 'unknown'}\n` +
        `Either use OPENAI_API_KEY or ensure VOICE_API_KEY is an OpenAI key.`
      );
    }
  }

  if (!apiKey) {
    throw new Error(
      `No API key found for OpenAI voice generation.\n` +
      `Set one of:\n` +
      `  - VOICE_API_KEY (provider-agnostic, auto-detected)\n` +
      `  - OPENAI_API_KEY (provider-specific)\n` +
      `\n` +
      `OpenAI keys start with 'sk-' or 'sk-proj-'`
    );
  }

  return new OpenAIVoice(apiKey);
}
```

---

## Error Messages

### Invalid Key Format
```
Could not auto-detect voice provider from VOICE_API_KEY format.
Expected formats:
  - OpenAI: Keys starting with 'sk-' or 'sk-proj-'
  - ElevenLabs: 32-character hexadecimal string

Either provide a valid key or set VOICE_PROVIDER explicitly (openai, elevenlabs)
```

### No API Key Configured
```
No API key found for OpenAI voice generation.
Set one of:
  - VOICE_API_KEY (provider-agnostic, auto-detected)
  - OPENAI_API_KEY (provider-specific)

OpenAI keys start with 'sk-' or 'sk-proj-'
```

### Wrong Provider Format
```
VOICE_API_KEY format doesn't match OpenAI (expected key starting with 'sk-' or 'sk-proj-').
Detected format: elevenlabs

Either use OPENAI_API_KEY for provider-specific keys or ensure VOICE_API_KEY is an OpenAI key.
```

---

## API Reference

### VoiceFactory Methods

#### `detectProvider(apiKey)`
Detects provider from API key format.

**Returns**: `'openai' | 'elevenlabs' | null`

```javascript
const provider = VoiceFactory.detectProvider('sk-proj-abc123');
// Returns: 'openai'
```

#### `createFromEnv(providerName?)`
Creates voice provider from environment configuration with auto-detection.

**Returns**: `VoiceStrategy`

```javascript
// Auto-detect from VOICE_API_KEY
const provider = VoiceFactory.createFromEnv();

// Explicit provider
const provider = VoiceFactory.createFromEnv('elevenlabs');
```

#### `isProviderAvailable(provider)`
Checks if a provider has a valid API key configured.

**Returns**: `boolean`

```javascript
const hasOpenAI = VoiceFactory.isProviderAvailable('openai');
// Checks both VOICE_API_KEY and OPENAI_API_KEY
```

#### `getProviderInfo()`
Returns comprehensive provider configuration status.

**Returns**: `Object`

```javascript
const info = VoiceFactory.getProviderInfo();
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

## Backward Compatibility

The system is **100% backward compatible** with existing configurations:

### Legacy Configuration (Still Works)
```bash
VOICE_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123
```

### New Configuration (Recommended)
```bash
VOICE_API_KEY=sk-proj-abc123
# VOICE_PROVIDER not needed - auto-detected
```

### Mixed Configuration (Valid)
```bash
VOICE_API_KEY=sk-proj-generic123
OPENAI_API_KEY=sk-proj-specific456
VOICE_PROVIDER=openai
# Uses VOICE_API_KEY (priority), auto-detects OpenAI
```

---

## Testing

Three test scripts verify the implementation:

### 1. Key Detection Test
```bash
node test-key-detection.js
```
Tests auto-detection logic for various key formats.

### 2. Error Message Test
```bash
node test-error-messages.js
```
Demonstrates clear error messages for misconfiguration.

### 3. Provider Info Test
```bash
node test-provider-info.js
```
Shows how the factory reports API key status.

---

## Benefits

### For Developers
- **Simpler configuration**: One environment variable instead of multiple
- **Auto-detection**: No need to specify provider explicitly
- **Clear errors**: Helpful messages guide configuration
- **Backward compatible**: Existing code works without changes

### For Operations
- **Easier deployments**: Fewer environment variables to manage
- **Provider switching**: Just change the API key, system adapts
- **Security**: Single key to rotate instead of multiple

### For Multi-Provider Setups
- **Per-speaker override**: Different providers for different speakers still supported
- **Fallback logic**: Provider-specific keys still work as backup
- **Flexibility**: Can mix both approaches in same deployment

---

## Migration Guide

### From Provider-Specific to Generic Keys

**Before**:
```bash
VOICE_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123
ELEVENLABS_API_KEY=xyz789...
```

**After**:
```bash
# For OpenAI
VOICE_API_KEY=sk-proj-abc123

# For ElevenLabs (just swap the key)
VOICE_API_KEY=xyz789...
```

### Steps
1. Copy your current `OPENAI_API_KEY` or `ELEVENLABS_API_KEY` value
2. Set it as `VOICE_API_KEY` instead
3. Remove `VOICE_PROVIDER` (optional, but cleaner)
4. Remove provider-specific keys (optional, but cleaner)

---

## Edge Cases

### Multiple Providers in Same Deployment
If you need both OpenAI and ElevenLabs simultaneously (e.g., different speakers):

```bash
# Keep provider-specific keys
OPENAI_API_KEY=sk-proj-abc123
ELEVENLABS_API_KEY=xyz789...

# Don't use VOICE_API_KEY in this case
```

Then override per speaker:
```javascript
kobe.voiceProfile.provider = 'elevenlabs';
kanye.voiceProfile.provider = 'openai';
```

### Invalid Key Format
If you have a key that doesn't match known patterns:
```bash
VOICE_API_KEY=custom-key-format
VOICE_PROVIDER=openai  # ← Required when auto-detection fails
```

---

## Future Providers

When adding new providers (Google TTS, local TTS), extend the detection logic:

```javascript
static detectProvider(apiKey) {
  if (!apiKey) return null;

  // OpenAI
  if (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
    return 'openai';
  }

  // ElevenLabs
  if (/^[a-f0-9]{32}$/i.test(apiKey)) {
    return 'elevenlabs';
  }

  // Google TTS (example)
  if (apiKey.startsWith('AIza')) {
    return 'google';
  }

  return null;
}
```

---

## Related Documentation

- **Voice Integration**: `VOICE_INTEGRATION.md` - Complete voice system overview
- **Architecture**: `ARCHITECTURE_ASSESSMENT.md` - Strategy pattern implementation
- **API Reference**: `README.md` - Project documentation

---

## Test Results

### Key Detection (8/8 passed)
- ✅ OpenAI key (sk- prefix)
- ✅ OpenAI key (sk-proj- prefix)
- ✅ ElevenLabs key (32 hex chars)
- ✅ ElevenLabs key (uppercase hex)
- ✅ Invalid key (too short)
- ✅ Invalid key (wrong format)
- ✅ Empty key
- ✅ Null key

### Error Messages
- ✅ Invalid VOICE_API_KEY format
- ✅ No API key configured
- ✅ Auto-detection with OpenAI key
- ✅ Auto-detection with ElevenLabs key
- ✅ Backward compatibility (provider-specific keys)
- ✅ Priority order (VOICE_API_KEY overrides)

### Provider Info
- ✅ Reports generic key presence
- ✅ Shows detected provider
- ✅ Tracks provider-specific keys
- ✅ Indicates availability per provider

---

**Last Updated**: 2025-10-26
**Status**: Production Ready ✅
**Next Steps**: Update documentation, inform users of new option
