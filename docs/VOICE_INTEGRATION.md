# Voice Integration Guide

**Status**: Implemented ✅
**Date**: October 25, 2025
**Providers**: OpenAI TTS, ElevenLabs

---

## Overview

The voice generation system is now fully integrated and **provider-agnostic**. You can switch between OpenAI TTS and ElevenLabs (or add new providers) by changing a single environment variable.

### Architecture

```
VoiceService (orchestrator)
    ↓
VoiceStrategy (interface)
    ↓
├─ OpenAIVoice Strategy
├─ ElevenLabsVoice Strategy
├─ GoogleTTS Strategy (TODO)
└─ LocalTTS Strategy (TODO)
```

---

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
# Choose your voice provider
VOICE_PROVIDER=openai  # or 'elevenlabs'

# Add the corresponding API key
OPENAI_API_KEY=sk-proj-...
# OR
ELEVENLABS_API_KEY=...
```

### 2. Test Voice Generation

Run the test script:

```bash
node test-voice-generation.js
```

This will:
- Generate a Kobe & Kanye dialogue about "Goroutines Basics"
- Create audio files for each message
- Save them to `output/audio/`
- Display file paths and durations

### 3. Use in Your Code

```javascript
import { ContentPipeline } from './src/lib/services/ContentPipeline.js';
import { Topic } from './src/lib/models/instagram/Topic.js';

const pipeline = ContentPipeline.fromEnv();

const result = await pipeline.generateDialogueContent({
  topic: myTopic,
  enableVoice: true  // ← Enable voice generation
});

// Access audio files
result.voice.audioFiles.forEach(audio => {
  console.log(`${audio.speakerName}: ${audio.audioPath}`);
});
```

---

## Provider Comparison

| Feature | OpenAI TTS | ElevenLabs |
|---------|-----------|------------|
| **Quality** | Good | Excellent (voice cloning) |
| **Pricing** | $15 / 1M chars | $30 / 1M chars |
| **Speed** | Fast (~2s per message) | Moderate (~3s per message) |
| **Voices** | 6 preset voices | 100+ cloned voices |
| **Best For** | MVP, testing, cost-sensitive | Production, celebrity clones |
| **Setup** | Easy | Requires voice cloning setup |

---

## Voice Configuration

### Kobe Bryant (Expert)

**OpenAI Voice**: `onyx`
- Deep, authoritative male voice
- Speed: 1.1x (faster for "rapid-fire" style)

**ElevenLabs Settings**:
- Stability: 0.7 (more stable for serious tone)
- Similarity: 0.8 (high accuracy)
- Style: 0.0 (no exaggeration)

### Kanye West (Novice)

**OpenAI Voice**: `fable`
- Expressive, dynamic male voice
- Speed: 0.95x (slightly slower for emphasis)

**ElevenLabs Settings**:
- Stability: 0.3 (less stable for chaotic personality)
- Similarity: 0.7 (good accuracy)
- Style: 0.5 (some exaggeration for expressiveness)

---

## Switching Providers

### Change Default Provider

Edit `.env`:

```bash
# Switch to ElevenLabs
VOICE_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_key_here
```

### Per-Speaker Override

You can use different providers for different speakers:

```javascript
import { Speaker } from './src/lib/models/dialogue/Speaker.js';

const kobe = Speaker.createKobeBryant();
kobe.voiceProfile.provider = 'elevenlabs';  // Use ElevenLabs for Kobe

const kanye = Speaker.createKanyeWest();
kanye.voiceProfile.provider = 'openai';     // Use OpenAI for Kanye
```

---

## File Structure

### New Files

```
src/lib/
├── strategies/
│   ├── VoiceStrategy.js        ← Base class for all providers
│   ├── OpenAIVoice.js          ← OpenAI TTS implementation
│   └── ElevenLabsVoice.js      ← ElevenLabs implementation
├── factories/
│   └── VoiceFactory.js         ← Provider selection factory
└── services/
    └── VoiceService.js         ← Main orchestrator

test-voice-generation.js        ← Test script
```

### Modified Files

```
src/lib/
├── models/dialogue/
│   └── Speaker.js              ← Added voiceProfile property
└── services/
    └── ContentPipeline.js      ← Added enableVoice parameter
```

---

## API Reference

### VoiceService

```javascript
import { VoiceService } from './src/lib/services/VoiceService.js';

// Create from environment
const voiceService = VoiceService.fromEnv();

// Or specify provider
const voiceService = VoiceService.withProvider('elevenlabs');

// Generate audio for single message
const audio = await voiceService.generateMessageAudio(text, speaker);
// Returns: { audioPath, duration, format, provider, metadata }

// Generate audio for entire dialogue
const result = await voiceService.generateDialogueAudio(dialogueContent);
// Returns: { audioFiles, errors, summary }
```

### ContentPipeline

```javascript
import { ContentPipeline } from './src/lib/services/ContentPipeline.js';

const pipeline = ContentPipeline.fromEnv();

const result = await pipeline.generateDialogueContent({
  topic: myTopic,
  reviewMode: true,
  enableVoice: true    // ← NEW: Enable voice generation
});

// Result structure:
{
  success: true,
  slide: Slide,
  dialogue: DialogueContent,
  topic: Topic,
  voice: {              // ← NEW: Voice generation results
    audioFiles: [
      {
        messageId: 'message-1',
        speakerId: 'speaker-abc',
        speakerName: 'KOBE BRYANT',
        text: 'Listen. Go has goroutines...',
        timestamp: 0,
        audioPath: './output/audio/openai-onyx-123.mp3',
        duration: 4500,
        format: 'mp3',
        provider: 'openai'
      }
    ],
    errors: [],
    summary: {
      total: 5,
      successful: 5,
      failed: 0,
      totalDuration: 35000,
      provider: 'openai'
    }
  },
  metadata: { ... }
}
```

### Speaker.voiceProfile

```javascript
{
  provider: 'openai' | 'elevenlabs' | null,  // null = use default
  voiceId: 'onyx',                            // Provider-specific voice ID
  model: 'tts-1',                             // Provider-specific model
  stability: 0.7,                             // ElevenLabs: 0-1
  similarity: 0.8,                            // ElevenLabs: 0-1
  style: 0.0,                                 // ElevenLabs: 0-1
  speed: 1.1                                  // OpenAI: 0.25-4.0
}
```

---

## Cost Estimation

### OpenAI TTS

**Pricing**: $15 per 1M characters

Example costs:
- Single message (50 chars): $0.00075
- 5-message dialogue (250 chars): $0.00375
- 100 daily videos: **$0.375/day** = $11.25/month

### ElevenLabs

**Pricing**: ~$30 per 1M characters (varies by plan)

Example costs:
- Single message (50 chars): $0.0015
- 5-message dialogue (250 chars): $0.0075
- 100 daily videos: **$0.75/day** = $22.50/month

**Recommendation**: Start with OpenAI TTS for testing, upgrade to ElevenLabs for production.

---

## Available Voices

### OpenAI TTS Voices

| Voice | Description | Best For |
|-------|-------------|----------|
| `alloy` | Neutral, balanced | General purpose |
| `echo` | Male, calm and clear | Technical explanations |
| `fable` | Male, expressive and dynamic | **Kanye (chaotic)** |
| `onyx` | Male, deep and authoritative | **Kobe (expert)** |
| `nova` | Female, warm and friendly | General purpose |
| `shimmer` | Female, soft and gentle | Calm narration |

### ElevenLabs Voices

ElevenLabs supports:
- 100+ pre-made professional voices
- Custom voice cloning (upload voice samples)
- Celebrity voice cloning (with proper authorization)

Popular pre-made voices:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (calm, clear female)
- `pNInz6obpgDQGcFmaJgB` - Adam (deep, resonant male)
- `yoZ06aMxZJJ28mfd3POQ` - Sam (dynamic, raspy male)

---

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is required"

**Solution**: Add your OpenAI API key to `.env`:

```bash
OPENAI_API_KEY=sk-proj-your_key_here
```

### Error: "Unknown voice provider: google"

**Solution**: Google TTS is not implemented yet. Use `openai` or `elevenlabs`:

```bash
VOICE_PROVIDER=openai
```

### Error: "ElevenLabs API error (401): Unauthorized"

**Solution**: Check your ElevenLabs API key is correct and active.

### Audio files not being generated

**Solution**: Ensure:
1. `enableVoice: true` is set in `generateDialogueContent()`
2. API key for your provider is set in `.env`
3. `output/audio/` directory exists (created automatically)

### Rate limiting errors

**Solution**: The system includes a 500ms delay between messages. For batch generation, add longer delays:

```javascript
await pipeline.batchGenerate(topics, {
  delayMs: 2000  // 2 seconds between topics
});
```

---

## Next Steps

### Immediate (Ready to Use)
1. Test with `node test-voice-generation.js`
2. Generate audio for your existing dialogues
3. Experiment with different voices and speeds

### Short Term (Next Session)
1. Implement audio stitching (combine message audio files)
2. Add background music mixing
3. Sync audio with video timestamps

### Long Term (Future)
1. Implement Google TTS provider
2. Add local TTS (offline, free)
3. Implement audio effects (reverb, EQ)
4. Add voice cloning pipeline for ElevenLabs

---

## Examples

### Basic Usage

```javascript
import { ContentPipeline } from './src/lib/services/ContentPipeline.js';
import { Topic } from './src/lib/models/instagram/Topic.js';

// Create topic
const topic = new Topic();
topic.title = 'Why Learn Go?';
topic.description = 'Discover why Go is perfect for modern backend development';
topic.category = 'intro';
topic.difficulty = 'beginner';

// Generate content with voice
const pipeline = ContentPipeline.fromEnv();
const result = await pipeline.generateDialogueContent({
  topic,
  enableVoice: true
});

console.log(`Generated ${result.voice.audioFiles.length} audio files`);
```

### Custom Voice Configuration

```javascript
import { Speaker } from './src/lib/models/dialogue/Speaker.js';

const customSpeaker = new Speaker();
customSpeaker.name = 'CUSTOM SPEAKER';
customSpeaker.role = 'expert';
customSpeaker.voiceProfile = {
  provider: 'openai',
  voiceId: 'echo',      // Different voice
  speed: 1.2,           // Faster speech
  model: 'tts-1-hd'     // High quality model
};
```

### Using VoiceService Directly

```javascript
import { VoiceService } from './src/lib/services/VoiceService.js';
import { Speaker } from './src/lib/models/dialogue/Speaker.js';

const voiceService = VoiceService.fromEnv();
const speaker = Speaker.createKobeBryant();

const audio = await voiceService.generateMessageAudio(
  'Listen. Go has goroutines built into the language.',
  speaker
);

console.log(`Audio saved to: ${audio.audioPath}`);
console.log(`Duration: ${audio.duration}ms`);
```

---

## Technical Notes

### Provider Strategy Pattern

The system uses the **Strategy Pattern** to make providers swappable:

1. **VoiceStrategy** - Base class defining the interface
2. **OpenAIVoice** - Concrete implementation for OpenAI
3. **ElevenLabsVoice** - Concrete implementation for ElevenLabs
4. **VoiceFactory** - Factory for creating the right strategy
5. **VoiceService** - Orchestrator that uses any strategy

### Adding a New Provider

To add a new provider (e.g., Google TTS):

1. Create `src/lib/strategies/GoogleTTSVoice.js`:

```javascript
import { VoiceStrategy } from './VoiceStrategy.js';

export class GoogleTTSVoice extends VoiceStrategy {
  async generateSpeech(text, voiceProfile) {
    // Implement Google TTS API call
  }

  getProviderName() {
    return 'google';
  }
}
```

2. Update `VoiceFactory.js`:

```javascript
case 'google':
  return new GoogleTTSVoice(process.env.GOOGLE_TTS_API_KEY);
```

3. Done! Now you can use `VOICE_PROVIDER=google`

---

## Related Documentation

- **Architecture**: `ARCHITECTURE_ASSESSMENT.md`
- **Creative Brief**: `CREATIVE_BRIEF.md` (voice requirements)
- **Postmortem**: `POSTMORTEM.md` (speaker ID bug fix)
- **API**: `README.md`

---

**Last Updated**: 2025-10-25
**Status**: Production Ready ✅
**Next Milestone**: Audio mixing + video composition
