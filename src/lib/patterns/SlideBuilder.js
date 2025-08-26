import { Slide } from '../models/Slide.js';

/**
 * Abstract base class for slide builders implementing the Builder Pattern
 * Provides the foundation for all concrete slide builders
 */
export class SlideBuilder {
  constructor() {
    this.slide = new Slide();
    this.buildSteps = [];
  }

  /**
   * Reset builder to create a new slide
   */
  reset() {
    this.slide = new Slide();
    this.buildSteps = [];
    return this;
  }

  /**
   * Track build steps for debugging and validation
   */
  addBuildStep(step, data) {
    this.buildSteps.push({
      step,
      data,
      timestamp: new Date().toISOString()
    });
    this.slide.touch();
    return this;
  }

  // Abstract methods - must be implemented by concrete builders
  setTitle(title) {
    throw new Error("Must implement setTitle");
  }

  setSubtitle(subtitle) {
    throw new Error("Must implement setSubtitle");
  }

  setContent(content) {
    throw new Error("Must implement setContent");
  }

  setLayout(layout) {
    throw new Error("Must implement setLayout");
  }

  setStyle(style) {
    throw new Error("Must implement setStyle");
  }

  // Common methods available to all builders
  setMetadata(metadata) {
    this.slide.metadata = { ...this.slide.metadata, ...metadata };
    this.addBuildStep('setMetadata', metadata);
    return this;
  }

  setTenantId(tenantId) {
    this.slide.metadata.tenantId = tenantId;
    this.addBuildStep('setTenantId', tenantId);
    return this;
  }

  addAsset(type, asset) {
    if (!this.slide.assets[type]) {
      this.slide.assets[type] = [];
    }
    this.slide.assets[type].push(asset);
    this.addBuildStep('addAsset', { type, asset });
    return this;
  }

  setAnimations(animations) {
    this.slide.animations = { ...this.slide.animations, ...animations };
    this.addBuildStep('setAnimations', animations);
    return this;
  }

  /**
   * Validate slide before returning result
   * Can be overridden by concrete builders for specific validation
   */
  validate() {
    this.slide.clearValidation();

    // Basic validation rules
    if (!this.slide.title || this.slide.title.trim() === '') {
      this.slide.addValidationError('Title is required');
    }

    if (!this.slide.type) {
      this.slide.addValidationError('Slide type must be specified');
    }

    if (Object.keys(this.slide.content).length === 0) {
      this.slide.addValidationWarning('Slide has no content');
    }

    // Allow concrete builders to add their own validation
    this.customValidation();

    return this.slide.validation.errors.length === 0;
  }

  /**
   * Override in concrete builders for type-specific validation
   */
  customValidation() {
    // Default: no additional validation
  }

  /**
   * Get the completed slide
   * Validates before returning
   */
  getResult() {
    this.validate();
    return this.slide;
  }

  /**
   * Get build history for debugging
   */
  getBuildHistory() {
    return {
      steps: this.buildSteps,
      slideId: this.slide.id,
      isValid: this.slide.validation.isValid
    };
  }
}