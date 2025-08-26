import { TextSlideBuilder } from '../builders/TextSlideBuilder.js';
import { ChartSlideBuilder } from '../builders/ChartSlideBuilder.js';
import { TenantRegistry } from './TenantRegistry.js';

/**
 * Factory for creating appropriate slide builders
 */
export class BuilderFactory {
  static createBuilder(slideType, tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);
    
    // Check if tenant has custom builder for this type
    if (tenant?.hasCustomBuilder(slideType)) {
      return tenant.getCustomBuilder(slideType);
    }

    // Default builders
    switch (slideType) {
      case 'text':
        return new TextSlideBuilder();
      case 'chart':
        return new ChartSlideBuilder();
      case 'infographic':
        // Would import InfographicSlideBuilder when implemented
        throw new Error('InfographicSlideBuilder not yet implemented');
      default:
        throw new Error(`Unknown slide type: ${slideType}`);
    }
  }

  static getSupportedTypes(tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);
    const defaultTypes = ['text', 'chart'];
    const customTypes = tenant ? tenant.getCustomBuilderTypes() : [];
    
    return [...defaultTypes, ...customTypes];
  }
}