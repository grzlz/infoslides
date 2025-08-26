/**
 * Abstract base class for slide builders implementing the Builder Pattern
 */
export class SlideBuilder {
  constructor() {
    this.slide = this.createSlide();
  }

  createSlide() {
    return {
      id: null,
      type: null,
      title: '',
      content: {},
      layout: {},
      style: {},
      metadata: {}
    };
  }

  // Abstract methods - must be implemented by concrete builders
  setTitle(title) {
    throw new Error("Must implement setTitle");
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

  getResult() {
    return this.slide;
  }
}