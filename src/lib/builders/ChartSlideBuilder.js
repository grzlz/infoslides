import { SlideBuilder } from '../patterns/SlideBuilder.js';

/**
 * Concrete builder for chart-based slides
 */
export class ChartSlideBuilder extends SlideBuilder {
  setTitle(title) {
    this.slide.title = title;
    this.slide.type = 'chart';
    return this;
  }

  setContent(content) {
    this.slide.content = {
      data: content.data,
      chartType: content.chartType,
      axes: content.axes,
      legend: content.legend || true
    };
    return this;
  }

  setLayout(layout) {
    this.slide.layout = {
      ...layout,
      chartPosition: layout.chartPosition || 'center',
      showDataLabels: layout.showDataLabels || false
    };
    return this;
  }

  setStyle(style) {
    this.slide.style = {
      ...style,
      colorScheme: style.colorScheme || 'default',
      borderWidth: style.borderWidth || 1
    };
    return this;
  }

  setChartOptions(options) {
    this.slide.chartOptions = options;
    return this;
  }
}