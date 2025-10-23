# Infography Factory Engine

An AI-powered content generation pipeline for creating daily educational programming content. Built on SvelteKit with Svelte 5's modern runes syntax, implementing design patterns for extensible slide creation and automated social media content generation.

## Current Project: Learn Go Instagram Reels Pipeline

The engine is currently configured to generate daily "Learn Go" programming content in a novice-expert dialogue format, optimized for Instagram Reels. The AI-powered pipeline automatically:

- **Generates educational conversations** between a novice learner and Go expert
- **Creates visual slides** with syntax-highlighted code examples
- **Composites over Minecraft parkour footage** for engaging background (brain-rot style)
- **Exports Instagram-ready videos** (MP4, 1080x1350, 30fps)
- **Optional AI voiceover** with distinct novice/expert voices
- **Produces engaging captions** with relevant hashtags
- **Schedules daily content** for consistent posting

### Video Format Features

- **Background B-Roll**: Minecraft parkour/speedrun footage to maintain viewer attention
- **Overlay Design**: Dialogue bubbles and code snippets centered over gameplay
- **Smart Segmentation**: Random video clips from library (avoids repetition)
- **Animations**: Fade-in dialogue, typing effect for code, smooth transitions
- **Audio Layers**: Optional AI voiceover + background music mix
- **Instagram Optimized**: Perfect specs for Reels (H.264, 5000kbps, 30fps)

### Architecture Flow

**View the Architecture:**
- **Mermaid Source**: [docs/sequence-diagram.mmd](./docs/sequence-diagram.mmd) - Raw Mermaid diagram (view on GitHub or in compatible editors)
- **Interactive HTML**: [docs/sequence-diagram.html](./docs/sequence-diagram.html) - Open in browser for rendered view
- **Generate PDF**: Open the HTML file in a browser and use Print → Save as PDF

The comprehensive sequence diagram shows the complete flow: AI content generation → slide building → video compositing → Instagram Reels export pipeline.

To regenerate the diagram HTML:
```sh
npm run docs:diagram
```

## Overview

The Infography Factory Engine separates slide construction logic from presentation concerns, enabling different content types (educational dialogues, charts, infographics) while sharing the underlying construction infrastructure. Using pure JavaScript instead of TypeScript, the system prioritizes simplicity and accessibility while maintaining robust architecture through well-defined design patterns and clear separation of concerns.

## Architecture Patterns

The engine implements a combination of proven design patterns working together to create a flexible, extensible system:

### 1. Builder Pattern - Slide Construction
The Builder Pattern separates the construction of complex slides from their representation. Each slide type has its own builder that knows how to construct that specific type.

```javascript
// Abstract base builder
class SlideBuilder {
  setTitle(title) { /* implementation */ }
  setContent(content) { /* implementation */ }
  setLayout(layout) { /* implementation */ }
  setStyle(style) { /* implementation */ }
  getResult() { return this.slide; }
}

// Concrete builders for specific slide types
class TextSlideBuilder extends SlideBuilder { /* text-specific logic */ }
class ChartSlideBuilder extends SlideBuilder { /* chart-specific logic */ }
```

### 2. Strategy Pattern - Pluggable Behaviors
Strategy Pattern enables swapping algorithms (styling, layout) without changing the classes that use them. Each tenant can have their own styling and layout strategies.

```javascript
// Style strategies for different tenants
class CorporateStyleStrategy {
  getStyles() { return { /* corporate styling */ }; }
}

class CreativeStyleStrategy {
  getStyles() { return { /* creative styling */ }; }
}
```

### 3. Director Pattern - Construction Orchestration
The Director knows HOW to build slides using the builders. It encapsulates the construction sequence and applies tenant-specific rules.

```javascript
class SlideDirector {
  buildAdvancedSlide(slideData, tenant) {
    return this.builder
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .setLayout(slideData.layout)
      .setStyle(tenant.styleStrategy.getStyles())
      .getResult();
  }
}
```

### 4. Factory Pattern - Object Creation
Factory Pattern handles the creation of appropriate builders and strategies based on context, enabling multi-tenant customization.

```javascript
class BuilderFactory {
  static createBuilder(slideType, tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);
    // Return appropriate builder based on type and tenant
  }
}
```

## Multi-Tenant Extensibility

### Tenant Registration
Organizations register their configurations:

```javascript
// Register ACME Corp with custom settings
TenantRegistry.registerTenant('acme-corp', {
  styleType: 'corporate',
  brandColors: { primary: '#003366', secondary: '#6699CC' },
  customBuilders: { 'financial-report': FinancialReportSlideBuilder },
  layoutPreferences: { defaultColumns: 2 },
  requiresWatermark: true
});
```

### Custom Builders
Tenants can define specialized builders:

```javascript
class HIPAASlideBuilder extends SlideBuilder {
  setContent(content) {
    // Automatically redact sensitive information
    const redactedContent = this.redactSensitiveData(content);
    super.setContent(redactedContent);
    return this;
  }
}
```

## Pipeline Components

### AI Content Generation
- **TopicGenerator**: Schedules progressive Go programming topics
- **AI Service Integration**: Generates novice-expert dialogues using GPT/Claude
- **Content Validation**: Ensures educational quality and code accuracy
- **Voiceover Generation**: Optional AI text-to-speech for dialogue (distinct voices)

### Slide Construction
- **DialogueSlideBuilder**: Formats conversations with speaker avatars and threading
- **InstagramStyleStrategy**: Applies Instagram Reels-optimized styling (dimensions, contrast, readability)
- **Code Highlighting**: Syntax highlighting for Go code snippets

### Video Processing
- **VideoManager**: Manages Minecraft parkour footage library, selects random clips
- **VideoCompositor**: FFmpeg-based overlay compositing (dialogue on gameplay)
- **Animation Engine**: Fade-in effects, code typing animations, smooth transitions
- **Audio Mixer**: Combines voiceovers with background music

### Export & Delivery
- **VideoExporter**: High-quality MP4 export (H.264, Instagram Reels specs)
- **Caption Generator**: AI-powered captions with hashtags
- **Batch Processing**: Daily automated generation with error handling
- **Thumbnail Generator**: Static frame extraction for video preview

## Usage Example

### Educational Content Pipeline

```javascript
// Generate daily "Learn Go" Instagram Reels content
const pipeline = new ContentPipeline({
  tenantId: 'go-education',
  aiService: 'openai', // or 'claude', 'local'
  format: {
    width: 1080,
    height: 1350,
    fps: 30
  },
  video: {
    backgroundType: 'minecraft-parkour',
    enableVoiceover: true,
    backgroundMusic: true
  }
});

// Generate today's content
const result = await pipeline.generateDailyContent({
  date: new Date(),
  topic: 'goroutines-basics', // or auto-generate
  reviewMode: true // manual approval before export
});

// Output:
// {
//   slide: Slide { dialogue, code, speakers },
//   video: './output/2025-10-23-goroutines.mp4',
//   thumbnail: './output/2025-10-23-goroutines.jpg',
//   caption: 'Learn Go goroutines! 🚀 #golang #programming...',
//   metadata: { topic, difficulty, hashtags, duration: '45s' }
// }
```

### Traditional Slide Generation

```javascript
// Generate a slide for other use cases
const slideEngine = new SlideEngine();

const slide = slideEngine.generateSlide({
  type: 'chart',
  tenantId: 'acme-corp',
  data: {
    title: 'Q4 Sales Results',
    content: { data: [100, 150, 120, 200], chartType: 'bar' },
    layoutType: 'single-column'
  }
});
```

## CLI Usage

Generate Instagram Reels content from the command line:

```sh
# Generate today's content (with video)
node scripts/generate-daily.js

# Generate with specific topic
node scripts/generate-daily.js --topic goroutines-basics

# Disable voiceover (text only)
node scripts/generate-daily.js --no-audio

# Use different background theme
node scripts/generate-daily.js --background minecraft-speedrun

# Batch generate week's content
node scripts/generate-daily.js --batch 7

# Preview mode (no export, show in browser)
node scripts/generate-daily.js --preview

# Export static image instead of video
node scripts/generate-daily.js --format image
```

## Benefits

### For Content Creators
1. **Automated Content**: Daily educational posts with zero manual work
2. **Consistent Quality**: AI ensures engaging novice-expert dialogues
3. **Code Accuracy**: Validated Go syntax and best practices
4. **Instagram Optimized**: Perfect dimensions, contrast, and readability

### For Developers
1. **Extensibility**: New slide types = new builders. New styling = new strategies.
2. **Multi-Tenant**: Support multiple content brands/styles simultaneously
3. **Consistency**: Director pattern ensures all slides follow construction rules
4. **Maintainability**: Changes to one tenant don't affect others
5. **Testability**: Each pattern component can be unit tested independently

## Technology Stack

- **SvelteKit 5** with modern runes syntax for reactive state management
- **Pure JavaScript** (no TypeScript - prioritizes simplicity)
- **AI Integration** - OpenAI GPT / Anthropic Claude for content generation & voiceover
- **FFmpeg** for video compositing, encoding, and audio mixing
- **Tailwind CSS v4** for utility-first styling and Instagram Reels-optimized design
- **html-to-image** library for thumbnail generation and fallback image export
- **Prism.js** for Go syntax highlighting
- **Remotion** (optional) for programmatic video rendering with React-like components
- **Vitest + Playwright** for comprehensive testing

## Developing

Install dependencies and start the development server:

```sh
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Create a production version:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Testing

Run the test suite:

```sh
npm run test        # Run tests once
npm run test:unit   # Run tests in watch mode
```

## Code Quality

Lint and format code:

```sh
npm run lint        # Check linting
npm run format      # Format code with Prettier
```
