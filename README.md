# Infography Factory Engine

A multi-tenant slide generation system built on SvelteKit with Svelte 5's modern runes syntax, implementing design patterns for extensible infographic creation.

## Overview

The Infography Factory Engine separates slide construction logic from presentation concerns, enabling multiple organizations to define custom slide styles, layouts, and content types while sharing the underlying construction infrastructure. Using pure JavaScript instead of TypeScript, the system prioritizes simplicity and accessibility while maintaining robust architecture through well-defined design patterns and clear separation of concerns.

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

## Usage Example

```javascript
// Generate a slide for tenant "acme-corp"
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

// The slide is automatically styled with ACME's brand colors,
// uses their preferred layout, and includes their watermark
```

## Benefits

1. **Extensibility**: New slide types = new builders. New styling = new strategies.
2. **Tenant Isolation**: Each tenant can have completely different builders/strategies
3. **Consistency**: Director ensures all slides follow construction rules
4. **Maintainability**: Changes to one tenant don't affect others
5. **Testability**: Each pattern component can be unit tested independently

## Technology Stack

- **SvelteKit 5** with modern runes syntax for reactive state management
- **Pure JavaScript** (no TypeScript - prioritizes simplicity)
- **Tailwind CSS v4** for utility-first styling and tenant-specific design systems
- **html-to-image** library for high-quality slide export functionality
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
