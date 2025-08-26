/**
 * Registry for managing tenant configurations and custom implementations
 */
export class TenantRegistry {
  static tenants = new Map();

  static registerTenant(tenantId, config) {
    this.tenants.set(tenantId, new TenantConfiguration(config));
  }

  static getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }

  static getAllTenants() {
    return Array.from(this.tenants.keys());
  }

  static removeTenant(tenantId) {
    return this.tenants.delete(tenantId);
  }
}

/**
 * Configuration object for individual tenants
 */
class TenantConfiguration {
  constructor(config) {
    this.tenantId = config.tenantId;
    this.name = config.name;
    this.styleType = config.styleType || 'corporate';
    this.brandColors = config.brandColors || {};
    this.customBuilders = config.customBuilders || {};
    this.layoutPreferences = config.layoutPreferences || {};
    this.validationRules = config.validationRules || [];
    this.requiresWatermark = config.requiresWatermark || false;
    this.watermark = config.watermark || '';
    this.customStyleStrategy = config.customStyleStrategy;
    this.customStyleConfig = config.customStyleConfig || {};
  }

  hasCustomBuilder(slideType) {
    return this.customBuilders.hasOwnProperty(slideType);
  }

  getCustomBuilder(slideType) {
    const BuilderClass = this.customBuilders[slideType];
    return BuilderClass ? new BuilderClass() : null;
  }

  getCustomBuilderTypes() {
    return Object.keys(this.customBuilders);
  }
}