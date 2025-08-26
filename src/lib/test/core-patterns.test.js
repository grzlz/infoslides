import { describe, it, expect, beforeEach } from 'vitest';
import { Slide } from '../models/Slide.js';
import { SlideBuilder } from '../patterns/SlideBuilder.js';
import { SlideDirector } from '../patterns/SlideDirector.js';
import { BuilderRegistry } from '../registry/BuilderRegistry.js';

// Test concrete builder for testing
class TestSlideBuilder extends SlideBuilder {
  setTitle(title) {
    this.slide.title = title;
    this.slide.type = 'test';
    this.addBuildStep('setTitle', title);
    return this;
  }

  setSubtitle(subtitle) {
    this.slide.subtitle = subtitle;
    this.addBuildStep('setSubtitle', subtitle);
    return this;
  }

  setContent(content) {
    this.slide.content = { text: content };
    this.addBuildStep('setContent', content);
    return this;
  }

  setLayout(layout) {
    this.slide.layout = { ...this.slide.layout, ...layout };
    this.addBuildStep('setLayout', layout);
    return this;
  }

  setStyle(style) {
    this.slide.style = { ...this.slide.style, ...style };
    this.addBuildStep('setStyle', style);
    return this;
  }
}

describe('Core Builder Pattern Infrastructure', () => {
  beforeEach(() => {
    BuilderRegistry.clear();
  });

  describe('Slide Model', () => {
    it('should create a slide with default properties', () => {
      const slide = new Slide();
      
      expect(slide.id).toBeDefined();
      expect(slide.title).toBe('');
      expect(slide.type).toBeNull();
      expect(slide.content).toEqual({});
      expect(slide.metadata.createdAt).toBeDefined();
      expect(slide.validation.isValid).toBe(false);
    });

    it('should clone a slide with new ID', () => {
      const original = new Slide();
      original.title = 'Test Title';
      original.content = { text: 'Test content' };
      
      const cloned = original.clone();
      
      expect(cloned.id).not.toBe(original.id);
      expect(cloned.title).toBe(original.title);
      expect(cloned.content).toEqual(original.content);
    });

    it('should serialize and deserialize correctly', () => {
      const slide = new Slide();
      slide.title = 'Test';
      slide.type = 'text';
      
      const json = slide.toJSON();
      const restored = Slide.fromJSON(json);
      
      expect(restored.title).toBe(slide.title);
      expect(restored.type).toBe(slide.type);
      expect(restored.id).toBe(slide.id);
    });
  });

  describe('SlideBuilder Base Class', () => {
    it('should create a slide builder with proper initialization', () => {
      const builder = new TestSlideBuilder();
      
      expect(builder.slide).toBeInstanceOf(Slide);
      expect(builder.buildSteps).toEqual([]);
    });

    it('should track build steps', () => {
      const builder = new TestSlideBuilder();
      builder.setTitle('Test Title');
      
      expect(builder.buildSteps).toHaveLength(1);
      expect(builder.buildSteps[0].step).toBe('setTitle');
      expect(builder.buildSteps[0].data).toBe('Test Title');
    });

    it('should validate slides correctly', () => {
      const builder = new TestSlideBuilder();
      const slide = builder.getResult();
      
      // Should have validation errors (no title, no type initially)
      expect(slide.validation.errors.length).toBeGreaterThan(0);
      
      // Add required fields
      builder.setTitle('Test Title').setContent('Test content');
      const validSlide = builder.getResult();
      
      expect(validSlide.validation.errors.length).toBe(0);
    });

    it('should reset builder state', () => {
      const builder = new TestSlideBuilder();
      builder.setTitle('Test').setContent('Content');
      
      expect(builder.buildSteps.length).toBeGreaterThan(0);
      
      builder.reset();
      
      expect(builder.buildSteps).toHaveLength(0);
      expect(builder.slide.title).toBe('');
    });
  });

  describe('SlideDirector', () => {
    let director;
    let builder;

    beforeEach(() => {
      builder = new TestSlideBuilder();
      director = new SlideDirector(builder);
    });

    it('should build basic slides', () => {
      const slideData = {
        title: 'Test Slide',
        content: 'Test content'
      };
      
      const slide = director.buildBasicSlide(slideData);
      
      expect(slide.title).toBe('Test Slide');
      expect(slide.content.text).toBe('Test content');
      expect(slide.type).toBe('test');
    });

    it('should build styled slides', () => {
      const slideData = {
        title: 'Styled Slide',
        subtitle: 'With subtitle',
        content: 'Styled content',
        layout: { columns: 2 },
        style: { color: 'blue' }
      };
      
      const slide = director.buildStyledSlide(slideData);
      
      expect(slide.title).toBe('Styled Slide');
      expect(slide.subtitle).toBe('With subtitle');
      expect(slide.layout.columns).toBe(2);
      expect(slide.style.color).toBe('blue');
    });

    it('should build advanced slides with tenant context', () => {
      const slideData = {
        title: 'Advanced Slide',
        content: 'Advanced content',
        tenantId: 'test-tenant'
      };
      
      const tenantContext = {
        tenantId: 'test-tenant',
        requiresWatermark: true,
        watermark: 'CONFIDENTIAL'
      };
      
      const slide = director.buildAdvancedSlide(slideData, tenantContext);
      
      expect(slide.title).toBe('Advanced Slide');
      expect(slide.metadata.tenantId).toBe('test-tenant');
      expect(slide.content.watermark).toBe('CONFIDENTIAL');
    });

    it('should record construction history', () => {
      const slideData = { title: 'Test', content: 'Content' };
      director.buildBasicSlide(slideData);
      
      const history = director.getConstructionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].method).toBe('buildBasicSlide');
    });

    it('should build from templates', () => {
      const template = {
        titleTemplate: 'Welcome {{name}}',
        contentTemplate: { text: 'Hello {{name}}, today is {{date}}' },
        layoutType: 'default'
      };
      
      const data = {
        name: 'John',
        date: '2024-01-15'
      };
      
      const slide = director.buildFromTemplate(template, data);
      
      expect(slide.title).toBe('Welcome John');
      expect(slide.content.text.text).toBe('Hello John, today is 2024-01-15');
    });
  });

  describe('BuilderRegistry', () => {
    it('should register and retrieve builders', () => {
      BuilderRegistry.registerBuilder('test', TestSlideBuilder, {
        name: 'Test Builder',
        category: 'testing'
      });
      
      expect(BuilderRegistry.hasBuilder('test')).toBe(true);
      
      const BuilderClass = BuilderRegistry.getBuilder('test');
      expect(BuilderClass).toBe(TestSlideBuilder);
      
      const instance = BuilderRegistry.createBuilder('test');
      expect(instance).toBeInstanceOf(TestSlideBuilder);
    });

    it('should validate builder implementations', () => {
      class InvalidBuilder {
        // Missing required methods
      }
      
      expect(() => {
        BuilderRegistry.registerBuilder('invalid', InvalidBuilder);
      }).toThrow();
    });

    it('should provide registry statistics', () => {
      BuilderRegistry.registerBuilder('test1', TestSlideBuilder, { category: 'test' });
      BuilderRegistry.registerBuilder('test2', TestSlideBuilder, { category: 'production' });
      
      const stats = BuilderRegistry.getStats();
      
      expect(stats.totalBuilders).toBe(2);
      expect(stats.categories).toContain('test');
      expect(stats.categories).toContain('production');
      expect(stats.registeredTypes).toContain('test1');
      expect(stats.registeredTypes).toContain('test2');
    });

    it('should handle bulk registration', () => {
      const builders = [
        {
          slideType: 'bulk1',
          builderClass: TestSlideBuilder,
          metadata: { category: 'bulk' }
        },
        {
          slideType: 'bulk2', 
          builderClass: TestSlideBuilder,
          metadata: { category: 'bulk' }
        }
      ];
      
      const results = BuilderRegistry.bulkRegister(builders);
      
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(BuilderRegistry.hasBuilder('bulk1')).toBe(true);
      expect(BuilderRegistry.hasBuilder('bulk2')).toBe(true);
    });
  });
});