import { SlideDirector } from './patterns/SlideDirector.js';
import { BuilderFactory } from './factories/BuilderFactory.js';
import { StrategyFactory } from './factories/StrategyFactory.js';
import { TenantRegistry } from './factories/TenantRegistry.js';

/**
 * Main engine class that orchestrates all patterns together
 * This is the primary interface for slide generation
 */
export class SlideEngine {
  constructor() {
    this.director = new SlideDirector();
  }

  /**
   * Generate a slide using the full pattern system
   */
  generateSlide(slideRequest) {
    const { type, tenantId, data, template } = slideRequest;

    // Factory creates appropriate builder
    const builder = BuilderFactory.createBuilder(type, tenantId);
    
    // Factory creates tenant strategies  
    const styleStrategy = StrategyFactory.createStyleStrategy(tenantId);
    const layoutStrategy = StrategyFactory.createLayoutStrategy(data.layoutType, tenantId);

    // Get tenant configuration
    const tenant = TenantRegistry.getTenant(tenantId);
    const tenantContext = {
      styleStrategy,
      layoutStrategy,
      requiresWatermark: tenant?.requiresWatermark,
      watermark: tenant?.watermark,
      validationRules: tenant?.validationRules
    };

    // Director orchestrates construction
    this.director.setBuilder(builder);
    
    if (template) {
      return this.director.buildFromTemplate(template, data, tenantContext);
    } else {
      return this.director.buildAdvancedSlide(data, tenantContext);
    }
  }

  /**
   * Generate multiple slides as a presentation
   */
  generatePresentation(presentationRequest) {
    const { slides, tenantId } = presentationRequest;
    
    return slides.map(slideData => this.generateSlide({
      ...slideData,
      tenantId
    }));
  }

  /**
   * Register a new tenant with their configurations
   */
  registerTenant(tenantId, config) {
    TenantRegistry.registerTenant(tenantId, {
      ...config,
      tenantId
    });
  }

  /**
   * Get available slide types for a tenant
   */
  getAvailableSlideTypes(tenantId) {
    return BuilderFactory.getSupportedTypes(tenantId);
  }
}