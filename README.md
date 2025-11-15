# Infography Factory Engine

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A multi-tenant slide generation system built on SvelteKit with Svelte 5's modern runes syntax, implementing classic design patterns (Builder, Strategy, Factory, Director) for extensible infographic creation. The engine separates slide construction logic from presentation concerns, enabling multiple organizations to define custom slide styles, layouts, and content types while sharing the underlying construction infrastructure.

## Why Use This Engine?

- **Extensible Architecture** - Add new slide types without modifying existing code
- **Multi-Tenant Support** - Multiple organizations with custom styles and validation rules
- **Design Pattern Foundation** - Built on proven Builder, Strategy, Factory, and Director patterns
- **Type Safety Without TypeScript** - Pure JavaScript with comprehensive JSDoc documentation
- **Modern Stack** - SvelteKit 5 with runes, Tailwind CSS v4, Vitest + Playwright
- **Separation of Concerns** - Clean separation between construction logic and presentation

## Features

- **Modular Slide Construction** - Builder Pattern with integrated validation
- **Multi-Tenant System** - Custom configurations, styles, and builders per organization
- **Interchangeable Style Strategies** - Strategy Pattern for custom branding
- **Construction Director** - Orchestrates complex sequences with business rules
- **Flexible Export** - High-quality image export via html-to-image
- **Comprehensive Testing** - Vitest + Playwright for Svelte components and business logic
- **Factory Pattern** - Tenant-specific builder and component creation

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/infoslides.git
cd infoslides
npm install
```

### Development Server

Start the development server:

```bash
npm run dev

# Or open automatically in browser
npm run dev -- --open
```

The application will be available at `http://localhost:5173`

## Usage Examples

### Generate a Slide with the Builder Pattern

```javascript
import { DialogueSlideBuilder } from '$lib/builders/DialogueSlideBuilder.js';
import { DialogueContent } from '$lib/models/dialogue/DialogueContent.js';

// Create dialogue content
const dialogue = new DialogueContent();

// Build a slide using the Builder Pattern
const builder = new DialogueSlideBuilder();
const slide = builder
  .setTitle('Understanding Goroutines in Go')
  .setContent(dialogue)
  .setLayout('portrait')
  .setStyle({ theme: 'dark', fontSize: 'large' })
  .setMetadata({
    category: 'education',
    tags: ['golang', 'programming']
  })
  .getResult();

// Validate before using
if (slide.validation.isValid) {
  console.log('Slide ready for export!');
} else {
  console.error('Validation errors:', slide.validation.errors);
}
```

### Register a Tenant

```javascript
import { TenantRegistry } from '$lib/factories/TenantRegistry.js';

TenantRegistry.registerTenant('acme-corp', {
  name: 'ACME Corporation',
  styleType: 'corporate',
  brandColors: {
    primary: '#003366',
    secondary: '#6699CC',
    background: '#FFFFFF',
    text: '#333333',
    accent: '#FF6B35'
  },
  layoutPreferences: {
    defaultColumns: 2,
    spacing: 'conservative'
  },
  validationRules: [
    { rule: 'require-watermark', enabled: true },
    { rule: 'max-slide-duration', value: 60 }
  ],
  requiresWatermark: true,
  watermark: 'ACME Corp - Confidential'
});
```

### Create Custom Builders for Tenants

Tenants can define specialized builders for their specific needs:

```javascript
import { SlideBuilder } from '$lib/patterns/SlideBuilder.js';

// Custom builder that redacts sensitive information
class HIPAASlideBuilder extends SlideBuilder {
  setContent(content) {
    // Automatically redact sensitive information
    const redactedContent = this.redactSensitiveData(content);
    this.slide.content = {
      original: '[REDACTED]',
      safe: redactedContent,
      disclaimer: 'HIPAA Compliant - Patient data protected'
    };
    return this;
  }

  redactSensitiveData(content) {
    // Redaction logic...
    return content
      .replace(/\d{3}-\d{2}-\d{4}/g, 'XXX-XX-XXXX') // SSN
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]'); // Names
  }

  customValidation() {
    // Additional HIPAA validation
    if (!this.slide.content.disclaimer) {
      this.slide.addValidationError('HIPAA disclaimer required');
    }
  }
}
```

## Architecture Overview

The engine implements four classic design patterns working together to create a flexible and extensible system. Each pattern solves a specific problem:

### 1. Builder Pattern - Slide Construction

Separates the construction of complex slides from their representation. Each slide type has its own builder that knows how to construct it.

**Problem it solves:** Create complex objects step by step without cluttering the constructor with optional parameters.

```javascript
// Abstract base builder
class SlideBuilder {
  setTitle(title) { /* implementation */ }
  setContent(content) { /* implementation */ }
  setLayout(layout) { /* implementation */ }
  setStyle(style) { /* implementation */ }
  getResult() { return this.slide; }
}

// Concrete builders for specific types
class TextSlideBuilder extends SlideBuilder { /* text logic */ }
class ChartSlideBuilder extends SlideBuilder { /* chart logic */ }
class DialogueSlideBuilder extends SlideBuilder { /* dialogue logic */ }
```

**Key advantage:** Adding a new slide type = creating a new builder. The rest of the system doesn't change.

### 2. Strategy Pattern - Interchangeable Behaviors

Allows swapping algorithms (styling, layout) without changing the classes that use them. Each tenant can have their own styling and layout strategies.

**Problem it solves:** Avoid giant `if/else` conditionals for different behaviors.

```javascript
// Style strategies for different tenants
class CorporateStyleStrategy {
  getStyles() {
    return {
      primaryColor: '#003366',
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: '2rem', body: '1rem' }
    };
  }
}

class CreativeStyleStrategy {
  getStyles() {
    return {
      primaryColor: '#FF6B6B',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: { title: '2.5rem', body: '1.1rem' }
    };
  }
}
```

**Key advantage:** Changing a tenant's style = swapping the strategy. Zero code modifications.

### 3. Director Pattern - Construction Orchestration

The Director knows HOW to build slides using builders. It encapsulates the construction sequence and applies tenant-specific rules.

**Problem it solves:** Centralizes construction knowledge to maintain consistency.

```javascript
class SlideDirector {
  buildAdvancedSlide(slideData, tenantContext) {
    return this.builder
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .setLayout(slideData.layout)
      .setStyle(tenantContext.styleStrategy.getStyles())
      .setMetadata({ tenantId: tenantContext.tenantId })
      .getResult();
  }
}
```

**Key advantage:** Construction rules are in one place. Global changes = modifying the Director.

### 4. Factory Pattern - Object Creation

Handles the creation of appropriate builders and strategies based on context, enabling multi-tenant customization.

**Problem it solves:** Avoids direct coupling between client code and concrete classes.

```javascript
class BuilderFactory {
  static createBuilder(slideType, tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);

    // Check if tenant has custom builder
    if (tenant?.hasCustomBuilder(slideType)) {
      return tenant.getCustomBuilder(slideType);
    }

    // Default builders
    switch (slideType) {
      case 'text': return new TextSlideBuilder();
      case 'chart': return new ChartSlideBuilder();
      case 'dialogue': return new DialogueSlideBuilder();
      default: throw new Error(`Unknown type: ${slideType}`);
    }
  }
}
```

**Key advantage:** Add custom builders per tenant without modifying the Factory.

## Multi-Tenant System

The engine supports multiple organizations running simultaneously, each with their own configuration, styles, and validation rules.

### Tenant Features

- **Configuration-driven customization** - Each organization defines its own settings
- **Tenant-specific style definitions** - Custom themes through Tailwind's theme system
- **Custom content builders** - Specialized builders following established patterns
- **Layout templates** - Configurable content zones and layout preferences
- **Validation rules** - Custom validation integrated into the construction pipeline
- **Performance isolation** - Separation between organizational configurations

### Tenant Configuration Options

```javascript
{
  name: 'Organization Name',
  styleType: 'corporate' | 'creative' | 'minimal',
  brandColors: {
    primary: '#color',
    secondary: '#color',
    background: '#color',
    text: '#color',
    accent: '#color'
  },
  customBuilders: {
    'slide-type': CustomSlideBuilder
  },
  layoutPreferences: {
    defaultColumns: 1 | 2 | 3,
    spacing: 'tight' | 'normal' | 'conservative'
  },
  validationRules: [
    { rule: 'rule-name', enabled: true, value: any }
  ],
  requiresWatermark: boolean,
  watermark: 'Watermark text'
}
```

## Project Structure

```
infoslides/
├── src/
│   ├── routes/              # SvelteKit file-based routing
│   │   └── +page.svelte     # Main application page
│   ├── lib/                 # Shared components and utilities ($lib/)
│   │   ├── builders/        # Builder pattern implementations
│   │   │   ├── SlideBuilder.js
│   │   │   ├── TextSlideBuilder.js
│   │   │   ├── ChartSlideBuilder.js
│   │   │   └── DialogueSlideBuilder.js
│   │   ├── strategies/      # Strategy pattern implementations
│   │   │   ├── StyleStrategy.js
│   │   │   ├── LayoutStrategy.js
│   │   │   └── ValidationStrategy.js
│   │   ├── factories/       # Factory pattern implementations
│   │   │   ├── BuilderFactory.js
│   │   │   ├── TenantRegistry.js
│   │   │   └── ComponentFactory.js
│   │   ├── directors/       # Director pattern implementations
│   │   │   └── SlideDirector.js
│   │   ├── models/          # Data models and entities
│   │   │   ├── Slide.js
│   │   │   ├── dialogue/
│   │   │   └── content/
│   │   └── components/      # Reusable Svelte components
│   └── app.css              # Global CSS and Tailwind config
├── static/                  # Static assets
│   └── tenants/             # Tenant-specific resources
├── tests/                   # Test files
│   ├── builders/            # Builder tests (.spec.js)
│   └── components/          # Component tests (.svelte.spec.js)
├── CLAUDE.md                # Project guidance for Claude Code
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

### Key Directories

- **`src/lib/builders/`** - Builder pattern implementations for slide construction
- **`src/lib/strategies/`** - Strategy pattern implementations for styling and layouts
- **`src/lib/factories/`** - Factory pattern implementations for tenant-specific components
- **`src/lib/directors/`** - Director pattern implementations for construction orchestration
- **`src/routes/`** - SvelteKit file-based routing and pages
- **`static/`** - Static assets and tenant-specific resources

## Technology Stack

- **[SvelteKit 5](https://kit.svelte.dev/)** - Framework with modern runes syntax for reactive state management
- **Pure JavaScript** - No TypeScript; prioritizes simplicity and accessibility
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling and tenant-specific design systems
- **[html-to-image](https://github.com/bubkoo/html-to-image)** - High-quality slide export functionality
- **[Vitest](https://vitest.dev/)** - Fast unit test framework
- **[Playwright](https://playwright.dev/)** - Browser-based testing for Svelte components

## Development Commands

### Development Server

```bash
npm run dev              # Start development server
npm run dev -- --open    # Start development server and open in browser
```

### Build and Preview

```bash
npm run build            # Create production build
npm run preview          # Preview production build
```

### Code Quality

```bash
npm run lint             # Check linting (Prettier + ESLint)
npm run format           # Format code with Prettier
```

### Testing

```bash
npm run test             # Run all tests once
npm run test:unit        # Run tests in watch mode
```

## Testing

The project uses Vitest + Playwright for comprehensive testing:

### Test Types

- **Browser testing** - Svelte components (`.svelte.spec.js`)
- **Server testing** - Builders and utilities (`.spec.js`)

### Test Focus Areas

- Builder pattern implementations
- Multi-tenant configurations
- Validation rules
- Strategy pattern behaviors
- Component rendering

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (during development)
npm run test:unit

# Run specific test file
npm run test -- path/to/test.spec.js
```

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { SlideBuilder } from '$lib/builders/SlideBuilder.js';

describe('SlideBuilder', () => {
  it('should create a valid slide', () => {
    const builder = new SlideBuilder();
    const slide = builder
      .setTitle('Test Slide')
      .setContent('Test content')
      .getResult();

    expect(slide.validation.isValid).toBe(true);
    expect(slide.title).toBe('Test Slide');
  });
});
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines

- Use pure JavaScript (no TypeScript)
- Follow existing design patterns (Builder, Strategy, Factory, Director)
- Add tests for new functionality
- Document with JSDoc comments
- Run `npm run lint` before committing
- Maintain clear separation between construction logic and presentation
- Ensure tenant isolation and secure configuration separation

## Troubleshooting

### Slides Not Validating

If a slide fails validation, check the errors:

```javascript
const slide = builder.getResult();

if (!slide.validation.isValid) {
  console.log('Errors:', slide.validation.errors);
  console.log('Warnings:', slide.validation.warnings);
}
```

Common errors:
- Empty title
- Missing content
- Invalid layout configuration
- Validation rules not met for tenant

### Development Server Issues

If the development server doesn't start:

```bash
# Clear SvelteKit cache
rm -rf .svelte-kit

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

## Design Philosophy

This project prioritizes:

- **Simple, maintainable solutions** over complex enterprise patterns
- **Clear separation of concerns** through well-defined design patterns
- **Extensibility** without modifying existing code
- **Multi-tenant isolation** for security and performance
- **Pure JavaScript** for accessibility and simplicity
- **Comprehensive testing** to ensure reliability

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Additional Resources

- **[CLAUDE.md](./CLAUDE.md)** - Development guidance for Claude Code
- **[SvelteKit Documentation](https://kit.svelte.dev/docs)** - Official SvelteKit docs
- **[Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)** - Modern reactive syntax
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[Vitest](https://vitest.dev/guide/)** - Testing framework documentation

---

Built with passion for clean code and extensible architecture.
