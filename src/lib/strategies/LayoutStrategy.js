/**
 * Layout strategies implementing the Strategy Pattern
 */
export class LayoutStrategy {
  getLayout(layoutType) {
    throw new Error("Must implement getLayout");
  }

  validateLayout(layout) {
    throw new Error("Must implement validateLayout");
  }
}

/**
 * Single column layout strategy
 */
export class SingleColumnLayoutStrategy extends LayoutStrategy {
  getLayout(layoutType) {
    return {
      type: 'single-column',
      columns: 1,
      contentWidth: '100%',
      alignment: 'center',
      spacing: 'normal'
    };
  }

  validateLayout(layout) {
    return layout.columns === 1;
  }
}

/**
 * Multi-column layout strategy
 */
export class MultiColumnLayoutStrategy extends LayoutStrategy {
  constructor(columnCount = 2) {
    super();
    this.columnCount = columnCount;
  }

  getLayout(layoutType) {
    return {
      type: 'multi-column',
      columns: this.columnCount,
      contentWidth: `${100 / this.columnCount}%`,
      alignment: 'justify',
      spacing: 'compact',
      gutter: '2rem'
    };
  }

  validateLayout(layout) {
    return layout.columns > 1 && layout.columns <= 4;
  }
}