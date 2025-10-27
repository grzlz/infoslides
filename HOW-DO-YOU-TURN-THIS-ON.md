# HOW DO YOU TURN THIS ON?

**The Infoslides CLI API Quick Start Guide**

This document explains how to use the Infoslides Engine as a programmatic API to generate slides without touching the UI.

---

## Installation & Setup

```javascript
// Import the main engine
import { SlideEngine } from './src/lib/SlideEngine.js';

// Create an instance
const engine = new SlideEngine();
```

That's it. You're ready to go.

---

## Core Concepts (TL;DR)

- **SlideEngine**: Main orchestrator. Your entry point for everything.
- **Builder Pattern**: Each slide type has a builder (TextSlideBuilder, ChartSlideBuilder, etc.)
- **Tenant**: Organizations can have custom styles, layouts, and validation rules
- **Director**: Orchestrates builders to create slides. Handles complex construction logic.
- **Strategies**: Pluggable style and layout systems that tenants can customize

---

## Basic Example: Create a Simple Slide

```javascript
import { SlideEngine } from './src/lib/SlideEngine.js';

const engine = new SlideEngine();

// Define your slide data
const slideRequest = {
  type: 'text',
  tenantId: 'mycompany',
  data: {
    title: 'My First Slide',
    content: 'This is the content of my slide.\nIt supports multiple lines.',
    layoutType: 'default'
  }
};

// Generate the slide
const slide = engine.generateSlide(slideRequest);

console.log(slide);
// Returns: { id, title, content, type, layout, style, metadata, validation, ... }
```

---

## API Reference

### SlideEngine

The main entry point for slide generation.

#### `generateSlide(slideRequest)`

Generate a single slide.

**Parameters:**
- `slideRequest` (object):
  - `type` (string): Slide type - `'text'`, `'chart'`, `'dialogue'`
  - `tenantId` (string): Organization identifier
  - `data` (object): Slide content and configuration
  - `template` (object, optional): Template-based generation

**Returns:** `Slide` object with complete slide data

**Example:**
```javascript
const slide = engine.generateSlide({
  type: 'text',
  tenantId: 'acme-corp',
  data: {
    title: 'Quarterly Results',
    content: 'Revenue up 20% YoY\nMarket share expanded',
    layout: { columns: 2 }
  }
});
```

---

#### `generatePresentation(presentationRequest)`

Generate multiple slides as a presentation.

**Parameters:**
- `presentationRequest` (object):
  - `slides` (array): Array of slide data objects
  - `tenantId` (string): Organization identifier

**Returns:** Array of `Slide` objects

**Example:**
```javascript
const slides = engine.generatePresentation({
  tenantId: 'acme-corp',
  slides: [
    { type: 'text', data: { title: 'Title Slide', content: 'Introduction' } },
    { type: 'chart', data: { title: 'Sales Data', content: { ... } } },
    { type: 'text', data: { title: 'Summary', content: 'Conclusion' } }
  ]
});
```

---

#### `registerTenant(tenantId, config)`

Register a new organization with custom settings.

**Parameters:**
- `tenantId` (string): Unique identifier for the organization
- `config` (object): Tenant configuration
  - `name` (string): Display name
  - `brandColors` (object): Brand color definitions
  - `styleType` (string): Style preset - `'corporate'`, `'creative'`, etc.
  - `layoutPreferences` (object): Default layout settings
  - `validationRules` (array): Custom validation rules
  - `requiresWatermark` (boolean): Add watermark to slides
  - `watermark` (string): Watermark text

**Example:**
```javascript
engine.registerTenant('acme-corp', {
  name: 'ACME Corporation',
  brandColors: {
    primary: '#0066CC',
    secondary: '#FF6600',
    accent: '#FFCC00'
  },
  styleType: 'corporate',
  requiresWatermark: true,
  watermark: '© ACME Corp 2024'
});
```

---

#### `getAvailableSlideTypes(tenantId)`

Get list of slide types available for a tenant.

**Parameters:**
- `tenantId` (string): Organization identifier

**Returns:** Array of slide type strings

**Example:**
```javascript
const types = engine.getAvailableSlideTypes('acme-corp');
// Returns: ['text', 'chart', 'dialogue']
```

---

## Slide Types

### 1. Text Slides

Simple text-based slides with paragraphs and formatting.

```javascript
const slide = engine.generateSlide({
  type: 'text',
  tenantId: 'mycompany',
  data: {
    title: 'My Text Slide',
    subtitle: 'Optional subtitle',
    content: 'Main content text\nSupports multiple lines',
    layout: {
      columns: 1,        // 1 or 2
      fontSize: 'medium', // small, medium, large
      alignment: 'left'   // left, center, right
    },
    style: {
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6
    }
  }
});
```

### 2. Chart Slides

Data visualization slides with charts and graphs.

```javascript
const slide = engine.generateSlide({
  type: 'chart',
  tenantId: 'mycompany',
  data: {
    title: 'Q4 Performance',
    content: {
      chartType: 'bar', // bar, line, pie, area
      dataPoints: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 120 }
      ],
      yAxis: 'Revenue ($)',
      xAxis: 'Month'
    }
  }
});
```

### 3. Dialogue Slides

Interactive conversation and content exchange slides.

```javascript
const slide = engine.generateSlide({
  type: 'dialogue',
  tenantId: 'mycompany',
  data: {
    title: 'Customer Conversation',
    content: {
      speakers: [
        { name: 'Agent', role: 'Support', color: '#0066CC' },
        { name: 'Customer', role: 'User', color: '#FF6600' }
      ],
      messages: [
        { speaker: 'Agent', text: 'How can I help you today?' },
        { speaker: 'Customer', text: 'I need assistance with my order' },
        { speaker: 'Agent', text: 'Let me look that up for you' }
      ]
    }
  }
});
```

---

## Advanced Usage

### Template-Based Generation

Generate slides from templates with data substitution.

```javascript
const slide = engine.generateSlide({
  type: 'text',
  tenantId: 'mycompany',
  template: {
    titleTemplate: 'Q{{quarter}} {{year}} Results',
    subtitleTemplate: 'Prepared for {{client}}',
    contentTemplate: {
      intro: 'Revenue: {{revenue}}',
      growth: 'YoY Growth: {{growth}}%',
      forecast: 'Next quarter forecast: {{forecast}}'
    }
  },
  data: {
    quarter: '4',
    year: '2024',
    client: 'Board of Directors',
    revenue: '$5.2M',
    growth: '23',
    forecast: '$6.1M'
  }
});
```

### Custom Validation Rules

Add tenant-specific validation to slides.

```javascript
engine.registerTenant('secure-corp', {
  name: 'Secure Corp',
  validationRules: [
    {
      validate: (slide) => slide.title.length <= 50,
      message: 'Title must be 50 characters or less'
    },
    {
      validate: (slide) => slide.content.wordCount < 500,
      message: 'Content must be under 500 words'
    },
    {
      validate: (slide) => !slide.content.text?.includes('password'),
      message: 'Slides cannot contain password information'
    }
  ]
});
```

### Metadata & Assets

Add metadata, animations, and assets to slides.

```javascript
const slide = engine.generateSlide({
  type: 'text',
  tenantId: 'mycompany',
  data: {
    title: 'Product Launch',
    content: 'Introduction to our new product line',
    metadata: {
      author: 'john.doe@company.com',
      department: 'Product',
      tags: ['launch', 'product', 'announcement'],
      confidential: 'internal'
    },
    animations: {
      entrance: 'fade-in',
      exit: 'fade-out',
      transition: 'slide-left'
    },
    assets: {
      images: [
        { url: '/images/product.jpg', position: 'center' }
      ],
      videos: [
        { url: '/videos/demo.mp4', duration: 30 }
      ]
    }
  }
});
```

---

## Direct Builder Usage

For fine-grained control, use builders directly.

```javascript
import { TextSlideBuilder } from './src/lib/builders/TextSlideBuilder.js';
import { SlideDirector } from './src/lib/patterns/SlideDirector.js';

const builder = new TextSlideBuilder();
const director = new SlideDirector(builder);

const slide = director
  .buildBasicSlide({
    title: 'My Slide',
    content: 'Some content here'
  });

// Or use styled slides
const styledSlide = director
  .buildStyledSlide({
    title: 'Styled Slide',
    subtitle: 'With custom formatting',
    content: 'Main content',
    layout: { columns: 2 },
    style: { fontFamily: 'Georgia' }
  });
```

---

## Response Structure

All slide generation methods return a `Slide` object with this structure:

```javascript
{
  id: 'slide-uuid-1234',                    // Unique identifier
  title: 'Slide Title',
  type: 'text',                              // Slide type
  content: {                                 // Type-specific content
    text: '...',
    paragraphs: ['...', '...'],
    wordCount: 150
  },
  layout: {                                  // Layout configuration
    columns: 1,
    fontSize: 'medium',
    alignment: 'left'
  },
  style: {                                   // Style configuration
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6
  },
  metadata: {                                // Slide metadata
    tenantId: 'mycompany',
    author: 'john.doe@company.com',
    tags: ['tag1', 'tag2'],
    createdAt: '2024-10-26T...',
    lastModified: '2024-10-26T...'
  },
  animations: {                              // Animation settings
    entrance: 'fade-in',
    transition: 'slide-left'
  },
  assets: {                                  // Attached assets
    images: [...],
    videos: [...]
  },
  validation: {                              // Validation results
    isValid: true,
    errors: [],
    warnings: []
  }
}
```

---

## Error Handling

Slides include validation information. Check before using:

```javascript
const slide = engine.generateSlide({...});

if (!slide.validation.isValid) {
  console.error('Validation errors:', slide.validation.errors);
  slide.validation.warnings.forEach(warn => console.warn(warn));
}

// Use slide only if valid
if (slide.validation.isValid) {
  // Process slide...
}
```

---

## Common Patterns

### Batch Processing

```javascript
const slides = engine.generatePresentation({
  tenantId: 'mycompany',
  slides: [
    { type: 'text', data: { title: 'Slide 1', content: '...' } },
    { type: 'text', data: { title: 'Slide 2', content: '...' } },
    { type: 'text', data: { title: 'Slide 3', content: '...' } }
  ]
});

// Filter for valid slides
const validSlides = slides.filter(s => s.validation.isValid);
```

### Multi-Tenant Generation

```javascript
const tenants = ['acme-corp', 'techstart-inc', 'design-studio'];

tenants.forEach(tenantId => {
  engine.registerTenant(tenantId, { /* config */ });

  const slide = engine.generateSlide({
    type: 'text',
    tenantId,
    data: { title: 'Welcome', content: 'Custom slide for ' + tenantId }
  });

  console.log(`Generated for ${tenantId}:`, slide);
});
```

### Reusing Builders

```javascript
const builder = new TextSlideBuilder();

// Create multiple slides with same builder
const slide1 = builder.reset().setTitle('First').setContent('Content 1').getResult();
const slide2 = builder.reset().setTitle('Second').setContent('Content 2').getResult();
const slide3 = builder.reset().setTitle('Third').setContent('Content 3').getResult();
```

---

## Debugging

### Build History

Inspect what happened during construction:

```javascript
const director = new SlideDirector(builder);
const slide = director.buildAdvancedSlide({...});

const history = director.getConstructionHistory();
console.log(history);
// Shows all construction steps with timestamps
```

### Validation Details

Get detailed validation information:

```javascript
const slide = engine.generateSlide({...});

console.log('Valid?', slide.validation.isValid);
console.log('Errors:', slide.validation.errors);
console.log('Warnings:', slide.validation.warnings);
```

---

## Tips & Tricks

1. **Always register tenants first** before generating slides for them
2. **Check validation** - slides can be created but invalid
3. **Use templates** for consistent formatting across presentations
4. **Chain builder methods** for fluid API usage
5. **Batch generate** presentations instead of individual slides when possible
6. **Store tenant configs** - don't re-register on every request

---

## What's NOT Here

This is a **programmatic API**. For UI-based slide editing, use the SvelteKit web interface at `/` (after running `npm run dev`).

---

## Next Steps

- Read the **IMPLEMENTATION_SUMMARY.md** for architecture details
- Check **src/lib/builders/** for slide type implementations
- Review **src/lib/factories/** for customization patterns
- Explore test files for usage examples

---

**Remember:** Simple solutions, not overengineering. This engine is built to be straightforward and extensible.
