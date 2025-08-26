import { CorporateStyleStrategy, CreativeStyleStrategy } from '../strategies/StyleStrategy.js';
import { SingleColumnLayoutStrategy, MultiColumnLayoutStrategy } from '../strategies/LayoutStrategy.js';
import { TenantRegistry } from './TenantRegistry.js';

/**
 * Factory for creating styling and layout strategies
 */
export class StrategyFactory {
  static createStyleStrategy(tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);
    
    if (!tenant) {
      return new CorporateStyleStrategy({
        primary: '#333333',
        background: '#ffffff',
        text: '#000000',
        accent: '#0066cc'
      });
    }

    switch (tenant.styleType) {
      case 'corporate':
        return new CorporateStyleStrategy(tenant.brandColors);
      case 'creative':
        return new CreativeStyleStrategy();
      case 'custom':
        // Would load tenant's custom strategy class
        return new tenant.customStyleStrategy(tenant.customStyleConfig);
      default:
        return new CorporateStyleStrategy(tenant.brandColors);
    }
  }

  static createLayoutStrategy(layoutType, tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);
    
    switch (layoutType) {
      case 'single-column':
        return new SingleColumnLayoutStrategy();
      case 'multi-column':
        const columns = tenant?.layoutPreferences?.defaultColumns || 2;
        return new MultiColumnLayoutStrategy(columns);
      default:
        return new SingleColumnLayoutStrategy();
    }
  }
}