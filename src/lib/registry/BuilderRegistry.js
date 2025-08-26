/**
 * Registry system for managing slide builders
 * Enables dynamic registration and discovery of builders
 */
export class BuilderRegistry {
  static registry = new Map();
  static metadata = new Map();

  /**
   * Register a builder class for a specific slide type
   */
  static registerBuilder(slideType, builderClass, metadata = {}) {
    if (!slideType || typeof slideType !== 'string') {
      throw new Error('Slide type must be a non-empty string');
    }

    if (!builderClass || typeof builderClass !== 'function') {
      throw new Error('Builder must be a constructor function');
    }

    // Validate builder implements required methods
    this.validateBuilder(builderClass, slideType);

    this.registry.set(slideType, builderClass);
    this.metadata.set(slideType, {
      name: metadata.name || slideType,
      description: metadata.description || `Builder for ${slideType} slides`,
      category: metadata.category || 'standard',
      version: metadata.version || '1.0.0',
      author: metadata.author || 'unknown',
      tenantSpecific: metadata.tenantSpecific || false,
      supportedFeatures: metadata.supportedFeatures || [],
      registeredAt: new Date().toISOString(),
      ...metadata
    });

    console.log(`✓ Registered builder for slide type: ${slideType}`);
    return true;
  }

  /**
   * Validate that a builder class implements required methods
   */
  static validateBuilder(builderClass, slideType) {
    const requiredMethods = ['setTitle', 'setContent', 'setLayout', 'setStyle', 'getResult'];
    const instance = new builderClass();

    for (const method of requiredMethods) {
      if (typeof instance[method] !== 'function') {
        throw new Error(`Builder for ${slideType} must implement ${method} method`);
      }
    }

    // Test that abstract methods throw errors (indicating proper inheritance)
    const abstractMethods = ['setTitle', 'setContent', 'setLayout', 'setStyle'];
    for (const method of abstractMethods) {
      try {
        instance[method]('test');
        // If it doesn't throw, it might be implemented (which is fine for concrete builders)
      } catch (error) {
        // Expected for abstract base class, fine for concrete implementations
      }
    }
  }

  /**
   * Get a builder class for a slide type
   */
  static getBuilder(slideType) {
    const builderClass = this.registry.get(slideType);
    if (!builderClass) {
      throw new Error(`No builder registered for slide type: ${slideType}`);
    }
    return builderClass;
  }

  /**
   * Create a new builder instance for a slide type
   */
  static createBuilder(slideType) {
    const BuilderClass = this.getBuilder(slideType);
    return new BuilderClass();
  }

  /**
   * Check if a builder is registered for a slide type
   */
  static hasBuilder(slideType) {
    return this.registry.has(slideType);
  }

  /**
   * Get all registered slide types
   */
  static getRegisteredTypes() {
    return Array.from(this.registry.keys());
  }

  /**
   * Get metadata for a builder
   */
  static getBuilderMetadata(slideType) {
    return this.metadata.get(slideType);
  }

  /**
   * Get all builders with their metadata
   */
  static getAllBuilders() {
    return Array.from(this.registry.entries()).map(([slideType, builderClass]) => ({
      slideType,
      builderClass,
      metadata: this.metadata.get(slideType)
    }));
  }

  /**
   * Get builders by category
   */
  static getBuildersByCategory(category) {
    return this.getAllBuilders().filter(
      builder => builder.metadata.category === category
    );
  }

  /**
   * Get tenant-specific builders
   */
  static getTenantBuilders() {
    return this.getAllBuilders().filter(
      builder => builder.metadata.tenantSpecific === true
    );
  }

  /**
   * Unregister a builder
   */
  static unregisterBuilder(slideType) {
    const existed = this.registry.has(slideType);
    this.registry.delete(slideType);
    this.metadata.delete(slideType);
    
    if (existed) {
      console.log(`✓ Unregistered builder for slide type: ${slideType}`);
    }
    
    return existed;
  }

  /**
   * Clear all registered builders
   */
  static clear() {
    const count = this.registry.size;
    this.registry.clear();
    this.metadata.clear();
    console.log(`✓ Cleared ${count} registered builders`);
    return count;
  }

  /**
   * Get registry statistics
   */
  static getStats() {
    const builders = this.getAllBuilders();
    const categories = [...new Set(builders.map(b => b.metadata.category))];
    const tenantBuilders = builders.filter(b => b.metadata.tenantSpecific);

    return {
      totalBuilders: builders.length,
      categories,
      categoryCounts: categories.reduce((acc, cat) => {
        acc[cat] = builders.filter(b => b.metadata.category === cat).length;
        return acc;
      }, {}),
      tenantSpecificCount: tenantBuilders.length,
      registeredTypes: this.getRegisteredTypes()
    };
  }

  /**
   * Export registry configuration for persistence
   */
  static exportConfig() {
    const builders = this.getAllBuilders();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      builders: builders.map(({ slideType, metadata }) => ({
        slideType,
        metadata
      }))
    };
  }

  /**
   * Bulk register builders from configuration
   */
  static bulkRegister(builders) {
    const results = [];
    
    for (const { slideType, builderClass, metadata } of builders) {
      try {
        this.registerBuilder(slideType, builderClass, metadata);
        results.push({ slideType, success: true });
      } catch (error) {
        results.push({ slideType, success: false, error: error.message });
        console.error(`Failed to register builder ${slideType}:`, error.message);
      }
    }
    
    return results;
  }
}