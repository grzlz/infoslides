/**
 * Director class implementing the Director Pattern
 * Orchestrates the construction of slides using builders
 * Knows HOW to build different types of slides with various complexity levels
 */
export class SlideDirector {
  constructor(builder = null) {
    this.builder = builder;
    this.constructionHistory = [];
  }

  /**
   * Set or change the builder
   */
  setBuilder(builder) {
    this.builder = builder;
    return this;
  }

  /**
   * Ensure builder is available
   */
  ensureBuilder() {
    if (!this.builder) {
      throw new Error('No builder assigned to director. Call setBuilder() first.');
    }
  }

  /**
   * Record construction step for debugging
   */
  recordConstruction(method, data, result) {
    this.constructionHistory.push({
      method,
      data,
      slideId: result?.id,
      timestamp: new Date().toISOString(),
      success: result?.validation?.isValid !== false
    });
  }

  /**
   * Build a basic slide with minimal setup
   */
  buildBasicSlide(slideData) {
    this.ensureBuilder();
    
    const result = this.builder
      .reset()
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .getResult();

    this.recordConstruction('buildBasicSlide', slideData, result);
    return result;
  }

  /**
   * Build a slide with layout configuration
   */
  buildStyledSlide(slideData) {
    this.ensureBuilder();
    
    let builder = this.builder
      .reset()
      .setTitle(slideData.title);

    if (slideData.subtitle) {
      builder = builder.setSubtitle(slideData.subtitle);
    }

    const result = builder
      .setContent(slideData.content)
      .setLayout(slideData.layout || {})
      .setStyle(slideData.style || {})
      .getResult();

    this.recordConstruction('buildStyledSlide', slideData, result);
    return result;
  }

  /**
   * Build an advanced slide with tenant-specific configuration
   */
  buildAdvancedSlide(slideData, tenantContext) {
    this.ensureBuilder();
    
    let builder = this.builder
      .reset()
      .setTenantId(tenantContext.tenantId || slideData.tenantId)
      .setTitle(slideData.title);

    if (slideData.subtitle) {
      builder = builder.setSubtitle(slideData.subtitle);
    }

    // Apply content
    builder = builder.setContent(slideData.content);

    // Apply tenant layout strategy if available
    if (tenantContext.layoutStrategy) {
      const layout = tenantContext.layoutStrategy.getLayout(slideData.layoutType || 'default');
      builder = builder.setLayout(layout);
    } else if (slideData.layout) {
      builder = builder.setLayout(slideData.layout);
    }

    // Apply tenant style strategy if available
    if (tenantContext.styleStrategy) {
      const style = tenantContext.styleStrategy.getStyles();
      builder = builder.setStyle(style);
    } else if (slideData.style) {
      builder = builder.setStyle(slideData.style);
    }

    // Add animations if specified
    if (slideData.animations) {
      builder = builder.setAnimations(slideData.animations);
    }

    // Add assets
    if (slideData.assets) {
      Object.entries(slideData.assets).forEach(([type, assets]) => {
        assets.forEach(asset => builder.addAsset(type, asset));
      });
    }

    const result = builder.getResult();

    // Apply tenant-specific post-processing
    this.applyTenantEnhancements(result, tenantContext);

    // Validate with tenant rules
    if (tenantContext.validationRules) {
      this.validateWithTenantRules(result, tenantContext.validationRules);
    }

    this.recordConstruction('buildAdvancedSlide', { slideData, tenantContext }, result);
    return result;
  }

  /**
   * Build slide from template
   */
  buildFromTemplate(template, data, tenantContext = {}) {
    this.ensureBuilder();
    
    // Process template data
    const processedData = {
      title: this.processTemplate(template.titleTemplate, data),
      subtitle: template.subtitleTemplate ? this.processTemplate(template.subtitleTemplate, data) : null,
      content: this.processContentTemplate(template.contentTemplate, data),
      layoutType: template.layoutType || 'default'
    };

    // Use advanced slide building with processed template data
    const result = this.buildAdvancedSlide(processedData, tenantContext);

    this.recordConstruction('buildFromTemplate', { template, data, tenantContext }, result);
    return result;
  }

  /**
   * Process simple template strings
   */
  processTemplate(template, data) {
    if (typeof template === 'function') {
      return template(data);
    }
    
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    }
    
    return template;
  }

  /**
   * Process content templates (more complex)
   */
  processContentTemplate(template, data) {
    if (typeof template === 'function') {
      return template(data);
    }
    
    if (typeof template === 'object' && template !== null) {
      const result = {};
      Object.entries(template).forEach(([key, value]) => {
        result[key] = this.processTemplate(value, data);
      });
      return result;
    }
    
    return this.processTemplate(template, data);
  }

  /**
   * Apply tenant-specific enhancements to completed slide
   */
  applyTenantEnhancements(slide, tenantContext) {
    // Add watermark if required
    if (tenantContext.requiresWatermark && tenantContext.watermark) {
      if (!slide.content.watermark) {
        slide.content.watermark = tenantContext.watermark;
      }
    }

    // Apply compliance modifications
    if (tenantContext.complianceLevel) {
      slide.metadata.complianceLevel = tenantContext.complianceLevel;
    }

    // Add tenant branding
    if (tenantContext.branding) {
      slide.style.branding = tenantContext.branding;
    }

    slide.touch();
  }

  /**
   * Validate slide against tenant-specific rules
   */
  validateWithTenantRules(slide, validationRules) {
    for (const rule of validationRules) {
      try {
        if (typeof rule.validate === 'function') {
          const isValid = rule.validate(slide);
          if (!isValid) {
            slide.addValidationError(rule.message || 'Tenant validation rule failed');
          }
        }
      } catch (error) {
        slide.addValidationError(`Validation rule error: ${error.message}`);
      }
    }
  }

  /**
   * Get construction history for debugging
   */
  getConstructionHistory() {
    return this.constructionHistory;
  }

  /**
   * Clear construction history
   */
  clearHistory() {
    this.constructionHistory = [];
    return this;
  }

  /**
   * Batch build multiple slides
   */
  buildMultipleSlides(slidesData, tenantContext = {}) {
    return slidesData.map((slideData, index) => {
      try {
        return this.buildAdvancedSlide(slideData, tenantContext);
      } catch (error) {
        console.error(`Failed to build slide ${index}:`, error);
        return null;
      }
    }).filter(Boolean);
  }
}