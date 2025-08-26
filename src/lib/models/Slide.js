/**
 * Core Slide data model with extensible properties
 * Represents a complete slide with all its components
 */
export class Slide {
  constructor() {
    this.id = this.generateId();
    this.type = null;
    this.title = '';
    this.subtitle = '';
    this.content = {};
    this.layout = {
      type: 'default',
      columns: 1,
      alignment: 'center',
      spacing: 'normal'
    };
    this.style = {
      theme: 'default',
      colors: {},
      typography: {},
      spacing: {}
    };
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      author: null,
      tenantId: null
    };
    this.assets = {
      images: [],
      icons: [],
      fonts: []
    };
    this.animations = {
      entrance: null,
      emphasis: null,
      exit: null
    };
    this.validation = {
      isValid: false,
      errors: [],
      warnings: []
    };
  }

  generateId() {
    return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update slide metadata timestamp
   */
  touch() {
    this.metadata.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Add validation error
   */
  addValidationError(error) {
    this.validation.errors.push({
      message: error,
      timestamp: new Date().toISOString()
    });
    this.validation.isValid = false;
    return this;
  }

  /**
   * Add validation warning
   */
  addValidationWarning(warning) {
    this.validation.warnings.push({
      message: warning,
      timestamp: new Date().toISOString()
    });
    return this;
  }

  /**
   * Clear all validation messages
   */
  clearValidation() {
    this.validation.errors = [];
    this.validation.warnings = [];
    this.validation.isValid = true;
    return this;
  }

  /**
   * Clone slide with new ID
   */
  clone() {
    const cloned = new Slide();
    
    // Deep copy all properties except ID and timestamps
    cloned.type = this.type;
    cloned.title = this.title;
    cloned.subtitle = this.subtitle;
    cloned.content = JSON.parse(JSON.stringify(this.content));
    cloned.layout = JSON.parse(JSON.stringify(this.layout));
    cloned.style = JSON.parse(JSON.stringify(this.style));
    cloned.assets = JSON.parse(JSON.stringify(this.assets));
    cloned.animations = JSON.parse(JSON.stringify(this.animations));
    
    // Copy metadata but update timestamps and clear validation
    cloned.metadata = {
      ...this.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    cloned.clearValidation();
    
    return cloned;
  }

  /**
   * Serialize slide to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      subtitle: this.subtitle,
      content: this.content,
      layout: this.layout,
      style: this.style,
      metadata: this.metadata,
      assets: this.assets,
      animations: this.animations,
      validation: this.validation
    };
  }

  /**
   * Create slide from JSON data
   */
  static fromJSON(data) {
    const slide = new Slide();
    
    slide.id = data.id || slide.id;
    slide.type = data.type || null;
    slide.title = data.title || '';
    slide.subtitle = data.subtitle || '';
    slide.content = data.content || {};
    slide.layout = { ...slide.layout, ...data.layout };
    slide.style = { ...slide.style, ...data.style };
    slide.metadata = { ...slide.metadata, ...data.metadata };
    slide.assets = { ...slide.assets, ...data.assets };
    slide.animations = { ...slide.animations, ...data.animations };
    slide.validation = { ...slide.validation, ...data.validation };
    
    return slide;
  }
}