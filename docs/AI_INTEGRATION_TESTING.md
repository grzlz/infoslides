# AI Integration Testing Guide

## Quick Start

The AI integration is now ready for testing! This allows you to generate Kobe & Kanye dialogues using Claude AI without waiting for the full video pipeline.

### Setup

1. **Get an Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Create an API key
   - Copy `.env.example` to `.env` and add your key:
   ```bash
   cp .env.example .env
   # Edit .env and add: ANTHROPIC_API_KEY=your_actual_key_here
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the Test Interface**
   - Navigate to: http://localhost:5173/test-ai
   - Or use the API directly: `POST /test-ai`

### Test Interface Features

**Visual UI** (`/test-ai` page):
- Select from 5 pre-configured Go topics
- Create custom topics on the fly
- Real-time dialogue generation with Claude
- Preview generated messages with speaker styling
- View duration, message count, and validation warnings
- Inspect raw JSON output

**API Endpoint** (`POST /test-ai`):
- Programmatic access to dialogue generation
- Returns full slide + dialogue + metadata
- Error handling with detailed messages

### What Gets Generated

When you click "Generate Dialogue", the system:

1. ✅ Takes a Topic (title, description, keywords, difficulty)
2. ✅ Calls Claude API with Kobe & Kanye personality prompts
3. ✅ Parses AI response into structured DialogueContent
4. ✅ Builds a Slide using DialogueSlideBuilder
5. ✅ Validates the result
6. ✅ Returns slide with full dialogue data

### Example API Usage

```javascript
// POST /test-ai
const response = await fetch('/test-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: {
      title: 'Goroutines Explained',
      description: 'Learn how Go\'s lightweight concurrency works',
      category: 'concurrency',
      difficulty: 'intermediate',
      keywords: ['goroutines', 'concurrency', 'go']
    }
  })
});

const result = await response.json();
console.log(result.data.dialogue.messages);
```

### Response Structure

```javascript
{
  success: true,
  data: {
    slide: Slide,          // Built slide with dialogue content
    dialogue: DialogueContent,  // Full dialogue with speakers and messages
    topic: Topic,          // Original topic
    metadata: {
      generatedAt: "2025-10-25T...",
      reviewMode: true,
      duration: 35000,     // milliseconds
      messageCount: 6,
      speakerCount: 2,
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    }
  }
}
```

### Sample Topics Available

1. **Why Learn Go?** (beginner, intro)
2. **Goroutines Explained** (intermediate, concurrency)
3. **Channels in Go** (intermediate, concurrency)
4. **Error Handling in Go** (beginner, basics)
5. **Go vs JavaScript** (intermediate, comparison)

### What's Next

After testing AI generation, the next phases will add:

- **Phase 3**: Render dialogue slides to PNG frames (html-to-image)
- **Phase 4**: Composite frames over background videos (Minecraft parkour)
- **Phase 5**: Export to MP4 using FFmpeg (Instagram Reels format)

For now, you can iterate on the AI prompts, test different topics, and refine the Kobe/Kanye dialogue style!

### Troubleshooting

**"ANTHROPIC_API_KEY environment variable is required"**
- Make sure `.env` file exists in project root
- Verify the API key is correctly formatted
- Restart dev server after adding `.env`

**AI generates invalid JSON**
- The system automatically strips markdown code blocks
- Check console logs for Claude's raw response
- Most issues auto-resolve on retry

**Validation warnings**
- Yellow warnings don't block generation
- Common: "Duration exceeds 90s" or "Message count > 50"
- Adjust prompts in AIService.js to fine-tune output

### Files Created

```
src/lib/services/
  ├── AIService.js           # Claude API integration
  └── ContentPipeline.js     # Main orchestrator

src/lib/builders/
  └── DialogueSlideBuilder.js  # Slide builder for dialogues

src/routes/test-ai/
  ├── +server.js             # API endpoint
  └── +page.svelte          # Test UI

.env.example                 # API key template
```

### Architecture Flow

```
User clicks "Generate" in /test-ai
         ↓
ContentPipeline.generateDialogueContent()
         ↓
AIService.generateDialogue()
         ↓
Claude API call with prompt
         ↓
Parse response → DialogueContent
         ↓
DialogueSlideBuilder.buildFromDialogue()
         ↓
Validate → Return Slide + Metadata
         ↓
UI displays messages with speaker styling
```

Enjoy testing the AI integration! 🚀
