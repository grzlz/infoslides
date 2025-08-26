# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Infography Factory Engine is a multi-tenant slide generation system built on SvelteKit with Svelte 5's modern runes syntax, implementing the Builder Pattern for extensible infographic creation. The engine separates slide construction logic from presentation concerns, enabling multiple organizations to define custom slide styles, layouts, and content types while sharing the underlying construction infrastructure.

## Development Commands

### Development Server
```bash
npm run dev              # Start development server
npm run dev -- --open   # Start development server and open in browser
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

## Architecture Overview

### Core Design Patterns
- **Builder Pattern**: Core slide construction with extensible builders for different slide types
- **Strategy Pattern**: Pluggable styling and layout strategies for multi-tenant customization
- **Factory Pattern**: Creation of tenant-specific builders and components
- **Director Pattern**: Orchestrates complex building sequences and validates construction workflows

### Technology Stack
- **SvelteKit 5** with modern runes syntax for reactive state management
- **Pure JavaScript** (no TypeScript - prioritizes simplicity and accessibility)
- **Tailwind CSS v4** for utility-first styling and tenant-specific design systems
- **html-to-image** library for high-quality slide export functionality
- **Vitest + Playwright** for browser-based testing of Svelte components

### Multi-Tenant Architecture
- Configuration-driven customization for organizations
- Tenant-specific style definitions through Tailwind's theme system
- Custom content builders following established builder patterns
- Layout templates with configurable content zones
- Validation rules integrated into construction pipeline
- Performance isolation between organizational configurations

### Project Structure
- `src/routes/` - SvelteKit file-based routing
- `src/lib/` - Shared components, builders, and utilities (imported as `$lib/`)
- `src/lib/builders/` - Builder pattern implementations for slide construction
- `src/lib/strategies/` - Strategy pattern implementations for styling and layouts
- `src/lib/factories/` - Factory pattern implementations for tenant-specific components
- `src/app.css` - Global CSS and Tailwind configurations
- `static/` - Static assets and tenant resources

### Testing Setup
- **Browser testing** with Vitest + Playwright for Svelte components (`.svelte.spec.js`)
- **Server testing** with Node environment for builders and utilities (`.spec.js`)
- Focus on testing builder patterns and multi-tenant configurations

### Development Notes
- Server typically runs on development, so avoid `npm run dev` commands
- No TypeScript checking needed (`npm run check` not used)
- Focus on simple, maintainable solutions over complex patterns
- Maintain clear separation between construction logic and presentation
- Ensure tenant isolation and secure configuration separation