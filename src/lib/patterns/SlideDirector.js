/**
 * Director class implementing the Director Pattern
 * Orchestrates the construction of slides using builders
 */
export class SlideDirector {
  constructor(builder) {
    this.builder = builder;
  }

  setBuilder(builder) {
    this.builder = builder;
  }

  buildBasicSlide(slideData) {
    return this.builder
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .setLayout(slideData.layout)
      .getResult();
  }

  buildAdvancedSlide(slideData, tenant) {
    const slide = this.builder
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .setLayout(slideData.layout)
      .setStyle(tenant.styleStrategy.getStyles())
      .getResult();

    // Apply tenant-specific enhancements
    if (tenant.requiresWatermark) {
      slide.watermark = tenant.watermark;
    }

    if (tenant.validationRules) {
      this.validateSlide(slide, tenant.validationRules);
    }

    return slide;
  }

  buildFromTemplate(template, data, tenant) {
    return this.builder
      .setTitle(template.titleFormat(data))
      .setContent(template.contentFormat(data))
      .setLayout(tenant.layoutStrategy.getLayout(template.layoutType))
      .setStyle(tenant.styleStrategy.getStyles())
      .getResult();
  }

  validateSlide(slide, rules) {
    // Implementation of validation logic
    for (const rule of rules) {
      if (!rule.validate(slide)) {
        throw new Error(`Validation failed: ${rule.message}`);
      }
    }
  }
}