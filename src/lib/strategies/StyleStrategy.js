/**
 * Abstract base class for styling strategies implementing the Strategy Pattern
 */
export class StyleStrategy {
  getStyles() {
    throw new Error("Must implement getStyles");
  }

  getColorScheme() {
    throw new Error("Must implement getColorScheme");
  }

  getTypography() {
    throw new Error("Must implement getTypography");
  }
}

/**
 * Corporate styling strategy
 */
export class CorporateStyleStrategy extends StyleStrategy {
  constructor(brandColors) {
    super();
    this.brandColors = brandColors;
  }

  getStyles() {
    return {
      primaryColor: this.brandColors.primary,
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: '2rem', body: '1rem' },
      spacing: 'conservative',
      borderRadius: '4px'
    };
  }

  getColorScheme() {
    return {
      background: this.brandColors.background,
      text: this.brandColors.text,
      accent: this.brandColors.accent
    };
  }

  getTypography() {
    return {
      headingFont: 'Arial, sans-serif',
      bodyFont: 'Arial, sans-serif',
      fontWeights: { normal: 400, bold: 700 }
    };
  }
}

/**
 * Creative styling strategy
 */
export class CreativeStyleStrategy extends StyleStrategy {
  getStyles() {
    return {
      primaryColor: '#FF6B6B',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: { title: '2.5rem', body: '1.1rem' },
      spacing: 'generous',
      borderRadius: '12px'
    };
  }

  getColorScheme() {
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      accent: '#FFD93D'
    };
  }

  getTypography() {
    return {
      headingFont: 'Montserrat, sans-serif',
      bodyFont: 'Open Sans, sans-serif',
      fontWeights: { normal: 300, bold: 600 }
    };
  }
}