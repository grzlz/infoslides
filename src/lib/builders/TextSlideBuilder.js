import { SlideBuilder } from '../patterns/SlideBuilder.js';

/**
 * Concrete builder for text-based slides
 */
export class TextSlideBuilder extends SlideBuilder {
  setTitle(title) {
    this.slide.title = title;
    this.slide.type = 'text';
    return this;
  }

  setContent(content) {
    this.slide.content = {
      paragraphs: content.split('\n'),
      wordCount: content.split(' ').length,
      text: content
    };
    return this;
  }

  setLayout(layout) {
    this.slide.layout = {
      ...layout,
      textColumns: layout.columns || 1,
      fontSize: layout.fontSize || 'medium',
      alignment: layout.alignment || 'left'
    };
    return this;
  }

  setStyle(style) {
    this.slide.style = {
      ...style,
      fontFamily: style.fontFamily || 'Arial, sans-serif',
      lineHeight: style.lineHeight || 1.6
    };
    return this;
  }
}