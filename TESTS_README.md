# Testing Guide

This document covers testing strategies for the Infography Factory Engine, focusing on environment configuration and text-to-audio functionality.

## Part 1: Environment Variable Validation

Before running any voice generation tests, you need to verify that your environment has the necessary API keys configured.

### What We're Testing

The system requires API keys for:
- **Dialogue Generation**: `ANTHROPIC_API_KEY` (Claude AI)
- **Voice Generation**: Either `OPENAI_API_KEY` or `ELEVENLABS_API_KEY` depending on your chosen provider
- **Provider Selection**: `VOICE_PROVIDER` environment variable (defaults to `'openai'`)

### How to Verify Environment Setup

#### Manual Check
Create a simple `.env` file in your project root:

```env
ANTHROPIC_API_KEY=sk-ant-...
VOICE_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Or for ElevenLabs:

```env
ANTHROPIC_API_KEY=sk-ant-...
VOICE_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=...
```

#### Automated Check
The `VoiceService.getProviderInfo()` method validates configuration:

```javascript
const providerInfo = VoiceService.getProviderInfo();
console.log(providerInfo.configured);  // 'openai' or 'elevenlabs'
console.log(providerInfo.apiKeys);     // Object showing which keys are present
```

### Testing Environment Variables

Run the environment validation test:

```bash
node test-voice-generation.js
```

**Expected Output**:
```
📋 Provider Configuration:
   Configured: openai
   API Keys: {
     "openai": true,
     "elevenlabs": false
   }

✅ Provider configured correctly
```

**If validation fails**, you'll see:
```
❌ Error: No API key found for provider 'openai'
   Set OPENAI_API_KEY in your .env file
```

### Key Validation Points

1. **API Key Presence**: The system checks if the configured provider has a valid API key
2. **Provider Selection**: Verify `VOICE_PROVIDER` is set to a supported value
3. **Early Exit**: The test script exits immediately if configuration is invalid (no wasted API calls)

---

## Part 2: Text-to-Audio Generation

Once environment variables are validated, the system generates audio from dialogue text using your selected voice provider.

### What We're Testing

The text-to-audio pipeline:
1. Takes generated dialogue messages (text + speaker info)
2. Sends each message to the voice provider (OpenAI TTS or ElevenLabs)
3. Receives audio files in response
4. Tracks generation metrics (success/failure, duration, file paths)

### How Text-to-Audio Works

#### Input: Dialogue Message
```javascript
{
  speaker: "Alex",
  text: "Goroutines are lightweight threads managed by the Go runtime",
  duration: 4500  // milliseconds
}
```

#### Output: Audio File
```javascript
{
  speakerName: "Alex",
  text: "Goroutines are lightweight threads managed by the Go runtime",
  audioPath: "audio/alex_message_1.mp3",
  duration: 4500,
  format: "mp3"
}
```

### Testing Text-to-Audio Generation

Run the full voice generation test:

```bash
node test-voice-generation.js
```

This test performs:
1. ✅ Environment validation
2. ✅ Dialogue generation for a test topic
3. ✅ Text-to-audio conversion for each dialogue message
4. ✅ Audio file creation and storage
5. ✅ Metrics collection (success rate, total duration)

### Understanding Test Output

#### Success Case
```
🤖 Step 1: Generating AI dialogue...

✅ Generation Complete!

📊 Results:
   Dialogue Messages: 5
   Dialogue Duration: 22s
   Speakers: Alex, Jordan, Casey

🎙️  Voice Generation:
   Provider: openai
   Audio Files: 5/5
   Total Duration: 22s

📂 Generated Audio Files:
   1. Alex: audio/alex_message_1.mp3
      Text: "Goroutines are lightweight threads managed by the Go..."
      Duration: 4s
   2. Jordan: audio/jordan_message_1.mp3
      Text: "Think of them as very cheap threads that the..."
      Duration: 5s
```

#### Partial Failure Case
```
🎙️  Voice Generation:
   Provider: openai
   Audio Files: 4/5
   Total Duration: 19s

⚠️  Errors:
   1. Message 2: API rate limit exceeded
```

### Key Metrics to Monitor

When testing text-to-audio, watch for:

| Metric | What It Means |
|--------|---------------|
| **Audio Files: X/Y** | How many messages were successfully converted to speech |
| **Total Duration** | Sum of all audio file durations (should match dialogue duration) |
| **Provider** | Which voice service processed the audio (openai or elevenlabs) |
| **File Paths** | Location where audio files are stored |

### Common Issues and Debugging

#### All Messages Failed
- Check API key is valid and has sufficient quota
- Check rate limits on your voice provider account
- Verify text content is within character limits

#### Partial Failures
- Some messages may exceed character limits
- API temporary unavailability
- Provider-specific text processing issues

#### No Audio Generated
- Ensure `enableVoice: true` was passed to `generateDialogueContent()`
- Check that dialogue generation completed successfully before voice step
- Verify output directory is writable

### Next Steps

Once environment variables and text-to-audio are working:
- Test slide generation with embedded audio
- Validate audio quality with different providers
- Test performance under load with multiple topics
