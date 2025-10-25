# Infography Factory Engine

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Descripcion

Motor de generacion de contenido educativo multitenant para crear slides infograficas y videos optimizados para redes sociales. Construido sobre SvelteKit 5 con sintaxis moderna de runes, implementa patrones de diseno clasicos (Builder, Strategy, Factory, Director) para crear un sistema extensible y mantenible que separa la logica de construccion de la presentacion.

**Caso de uso actual:** Pipeline automatizado que genera contenido diario "Learn Go" para Instagram Reels, presentando dialogos educativos entre celebridades (Kobe Bryant como experto y Kanye West como principiante), con codigo resaltado y video compuesto sobre footage de Minecraft parkour.

### Por que usar este motor?

- **Automatizacion completa**: Genera contenido educativo diario sin intervencion manual
- **Multi-tenant**: Soporta multiples organizaciones con estilos y reglas personalizadas
- **Arquitectura extensible**: Agrega nuevos tipos de slides sin modificar codigo existente
- **Optimizado para redes sociales**: Dimensiones, contraste y legibilidad perfectas para Instagram Reels
- **Generacion con IA**: Integra OpenAI/Claude para crear dialogos educativos naturales
- **Video profesional**: Pipeline completo de composicion, codificacion y exportacion con FFmpeg

## Caracteristicas

- **Generacion de contenido con IA** - Dialogos educativos automaticos con validacion de codigo
- **Construccion de slides modular** - Builder Pattern con validacion integrada
- **Sistema multi-tenant** - Configuraciones, estilos y builders personalizados por organizacion
- **Pipeline de video completo** - Composicion, animaciones, audio mixing y exportacion
- **Estrategias de estilo intercambiables** - Strategy Pattern para branding personalizado
- **Director de construccion** - Orquesta secuencias complejas con reglas de negocio
- **Exportacion flexible** - Video MP4, imagenes estaticas, o thumbnails
- **Testing completo** - Vitest + Playwright para componentes Svelte y logica de negocio

## Instalacion

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/tu-usuario/infoslides.git
cd infoslides
npm install
```

### Requisitos previos

- Node.js 18+
- FFmpeg (para procesamiento de video)
- API key de OpenAI o Anthropic (para generacion de contenido con IA)

Instala FFmpeg en tu sistema:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Descarga desde https://ffmpeg.org/download.html
```

## Uso

### Servidor de desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev

# O abre automaticamente en el navegador
npm run dev -- --open
```

### Generar contenido educativo

```javascript
import { ContentPipeline } from '$lib/services/ContentPipeline.js';

// Configura el pipeline de generacion
const pipeline = new ContentPipeline({
  tenantId: 'go-education',
  aiService: 'openai', // o 'claude', 'local'
  format: {
    width: 1080,
    height: 1350,
    fps: 30
  },
  video: {
    backgroundType: 'minecraft-parkour',
    enableVoiceover: true,
    backgroundMusic: true
  }
});

// Genera el contenido del dia
const result = await pipeline.generateDailyContent({
  date: new Date(),
  topic: 'goroutines-basics', // o auto-genera
  reviewMode: true // aprobacion manual antes de exportar
});

// Resultado:
// {
//   slide: Slide { dialogue, code, speakers },
//   video: './output/2025-10-23-goroutines.mp4',
//   thumbnail: './output/2025-10-23-goroutines.jpg',
//   caption: 'Aprende Go goroutines! #golang #programming...',
//   metadata: { topic, difficulty, hashtags, duration: '45s' }
// }
```

### Generar slides tradicionales

```javascript
import { SlideEngine } from '$lib/SlideEngine.js';

const slideEngine = new SlideEngine();

// Registra un tenant con configuracion personalizada
slideEngine.registerTenant('acme-corp', {
  styleType: 'corporate',
  brandColors: {
    primary: '#003366',
    secondary: '#6699CC'
  },
  layoutPreferences: { defaultColumns: 2 },
  requiresWatermark: true,
  watermark: 'ACME Corp - Confidential'
});

// Genera un slide tipo chart
const slide = slideEngine.generateSlide({
  type: 'chart',
  tenantId: 'acme-corp',
  data: {
    title: 'Resultados Q4 Ventas',
    content: {
      data: [100, 150, 120, 200],
      chartType: 'bar',
      axes: { x: 'Trimestres', y: 'Ingresos ($K)' }
    },
    layoutType: 'single-column'
  }
});
```

### Usar builders directamente

```javascript
import { DialogueSlideBuilder } from '$lib/builders/DialogueSlideBuilder.js';
import { DialogueContent } from '$lib/models/dialogue/DialogueContent.js';

// Crea contenido de dialogo
const dialogue = DialogueContent.createKobeKanyeTemplate('Aprende Go');

// Construye un slide con el Builder Pattern
const builder = new DialogueSlideBuilder();
const slide = builder
  .setTitle('Goroutines en Go')
  .setContent(dialogue)
  .setLayout('instagram-reels-portrait')
  .setStyle({ theme: 'dark', fontSize: 'large' })
  .setInstagramMetadata({
    hashtags: ['#golang', '#programming'],
    category: 'education'
  })
  .getResult();

// Valida antes de usar
if (slide.validation.isValid) {
  console.log('Slide listo para exportar!');
} else {
  console.error('Errores de validacion:', slide.validation.errors);
}
```

### CLI - Generacion rapida

Genera contenido desde la linea de comandos:

```bash
# Genera el contenido de hoy (con video)
node scripts/generate-daily.js

# Genera con un topico especifico
node scripts/generate-daily.js --topic goroutines-basics

# Sin voiceover (solo texto)
node scripts/generate-daily.js --no-audio

# Tema de fondo diferente
node scripts/generate-daily.js --background minecraft-speedrun

# Genera contenido de una semana completa
node scripts/generate-daily.js --batch 7

# Modo preview (no exporta, muestra en navegador)
node scripts/generate-daily.js --preview

# Exporta imagen estatica en lugar de video
node scripts/generate-daily.js --format image
```

## Arquitectura

El motor implementa cuatro patrones de diseno clasicos trabajando en conjunto para crear un sistema flexible y extensible. Cada patron resuelve un problema especifico:

### Diagramas arquitectonicos

Para entender visualmente como funcionan los componentes:

- **[system-architecture.mmd](./system-architecture.mmd)** - Arquitectura general del sistema
- **[sequence-diagram.mmd](./sequence-diagram.mmd)** - Flujo del pipeline de generacion
- **[main-interfaces.mmd](./main-interfaces.mmd)** - APIs publicas y builders
- **[class-diagram.mmd](./class-diagram.mmd)** - Jerarquia de clases y patrones

### 1. Builder Pattern - Construccion de slides

Separa la construccion de slides complejos de su representacion. Cada tipo de slide tiene su propio builder que sabe como construirlo.

**Problema que resuelve:** Crear objetos complejos paso a paso sin ensuciar el constructor con parametros opcionales.

```javascript
// Builder base abstracto
class SlideBuilder {
  setTitle(title) { /* implementacion */ }
  setContent(content) { /* implementacion */ }
  setLayout(layout) { /* implementacion */ }
  setStyle(style) { /* implementacion */ }
  getResult() { return this.slide; }
}

// Builders concretos para tipos especificos
class TextSlideBuilder extends SlideBuilder { /* logica de texto */ }
class ChartSlideBuilder extends SlideBuilder { /* logica de graficas */ }
class DialogueSlideBuilder extends SlideBuilder { /* logica de dialogos */ }
```

**Ventaja clave:** Agregar un nuevo tipo de slide = crear un nuevo builder. El resto del sistema no cambia.

### 2. Strategy Pattern - Comportamientos intercambiables

Permite intercambiar algoritmos (estilo, layout) sin cambiar las clases que los usan. Cada tenant puede tener sus propias estrategias de estilo y layout.

**Problema que resuelve:** Evitar condicionales gigantes `if/else` para diferentes comportamientos.

```javascript
// Estrategias de estilo para diferentes tenants
class CorporateStyleStrategy {
  getStyles() {
    return {
      primaryColor: '#003366',
      fontFamily: 'Arial, sans-serif',
      fontSize: { title: '2rem', body: '1rem' }
    };
  }
}

class CreativeStyleStrategy {
  getStyles() {
    return {
      primaryColor: '#FF6B6B',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: { title: '2.5rem', body: '1.1rem' }
    };
  }
}
```

**Ventaja clave:** Cambiar el estilo de un tenant = intercambiar la estrategia. Cero modificaciones al codigo.

### 3. Director Pattern - Orquestacion de construccion

El Director sabe COMO construir slides usando los builders. Encapsula la secuencia de construccion y aplica reglas especificas del tenant.

**Problema que resuelve:** Centraliza el conocimiento de construccion para mantener consistencia.

```javascript
class SlideDirector {
  buildAdvancedSlide(slideData, tenantContext) {
    return this.builder
      .setTitle(slideData.title)
      .setContent(slideData.content)
      .setLayout(slideData.layout)
      .setStyle(tenantContext.styleStrategy.getStyles())
      .setMetadata({ tenantId: tenantContext.tenantId })
      .getResult();
  }
}
```

**Ventaja clave:** Las reglas de construccion estan en un solo lugar. Cambios globales = modificar el Director.

### 4. Factory Pattern - Creacion de objetos

Maneja la creacion de builders y strategies apropiados basandose en el contexto, habilitando la personalizacion multi-tenant.

**Problema que resuelve:** Evita acoplamiento directo entre el codigo cliente y las clases concretas.

```javascript
class BuilderFactory {
  static createBuilder(slideType, tenantId) {
    const tenant = TenantRegistry.getTenant(tenantId);

    // Verifica si el tenant tiene builder personalizado
    if (tenant?.hasCustomBuilder(slideType)) {
      return tenant.getCustomBuilder(slideType);
    }

    // Builders por defecto
    switch (slideType) {
      case 'text': return new TextSlideBuilder();
      case 'chart': return new ChartSlideBuilder();
      case 'dialogue': return new DialogueSlideBuilder();
      default: throw new Error(`Tipo desconocido: ${slideType}`);
    }
  }
}
```

**Ventaja clave:** Agregar builders personalizados por tenant sin modificar la Factory.

## Sistema Multi-Tenant

El motor soporta multiples organizaciones ejecutandose simultaneamente, cada una con su propia configuracion, estilos y reglas de validacion.

### Registrar un tenant

```javascript
import { TenantRegistry } from '$lib/factories/TenantRegistry.js';

TenantRegistry.registerTenant('acme-corp', {
  name: 'ACME Corporation',
  styleType: 'corporate',
  brandColors: {
    primary: '#003366',
    secondary: '#6699CC',
    background: '#FFFFFF',
    text: '#333333',
    accent: '#FF6B35'
  },
  customBuilders: {
    'financial-report': FinancialReportSlideBuilder
  },
  layoutPreferences: {
    defaultColumns: 2,
    spacing: 'conservative'
  },
  validationRules: [
    { rule: 'require-watermark', enabled: true },
    { rule: 'max-slide-duration', value: 60 }
  ],
  requiresWatermark: true,
  watermark: 'ACME Corp - Confidential'
});
```

### Crear builders personalizados

Los tenants pueden definir builders especializados para sus necesidades:

```javascript
import { SlideBuilder } from '$lib/patterns/SlideBuilder.js';

// Builder personalizado que redacta informacion sensible
class HIPAASlideBuilder extends SlideBuilder {
  setContent(content) {
    // Redacta automaticamente informacion sensible
    const redactedContent = this.redactSensitiveData(content);
    this.slide.content = {
      original: '[REDACTED]',
      safe: redactedContent,
      disclaimer: 'HIPAA Compliant - Patient data protected'
    };
    return this;
  }

  redactSensitiveData(content) {
    // Logica de redaccion...
    return content
      .replace(/\d{3}-\d{2}-\d{4}/g, 'XXX-XX-XXXX') // SSN
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]'); // Nombres
  }

  customValidation() {
    // Validacion HIPAA adicional
    if (!this.slide.content.disclaimer) {
      this.slide.addValidationError('HIPAA disclaimer required');
    }
  }
}
```

## Componentes del Pipeline

El sistema esta organizado en cuatro capas principales que trabajan en secuencia:

### 1. Generacion de contenido con IA

**Responsabilidad:** Crear contenido educativo automaticamente usando modelos de lenguaje.

- **TopicGenerator**: Programa topicos progresivos de programacion Go
- **AIService**: Genera dialogos novato-experto usando GPT/Claude
- **ContentValidator**: Valida calidad educativa y precision del codigo
- **VoiceoverGenerator**: Genera text-to-speech con voces distintas (opcional)

**Archivo:** `/Users/guillermo/code/claude/tests/infoslides/src/lib/services/AIService.js`

### 2. Construccion de slides

**Responsabilidad:** Transformar contenido en slides estructurados y validados.

- **DialogueSlideBuilder**: Formatea conversaciones con avatares de speakers
- **InstagramStyleStrategy**: Aplica estilos optimizados para Instagram Reels
- **CodeHighlighter**: Resaltado de sintaxis para snippets de codigo Go
- **ValidationEngine**: Valida dimensiones, duracion y contenido

**Archivos:** `/Users/guillermo/code/claude/tests/infoslides/src/lib/builders/`

### 3. Procesamiento de video

**Responsabilidad:** Componer slides sobre video de fondo con animaciones.

- **VideoManager**: Administra biblioteca de footage de Minecraft parkour
- **VideoCompositor**: Composicion de overlays con FFmpeg
- **AnimationEngine**: Efectos fade-in, animaciones de tipeo, transiciones
- **AudioMixer**: Combina voiceovers con musica de fondo

**Archivos:** `/Users/guillermo/code/claude/tests/infoslides/src/lib/models/video/`

### 4. Exportacion y entrega

**Responsabilidad:** Generar archivos finales listos para publicar.

- **VideoExporter**: Exportacion MP4 de alta calidad (H.264, Instagram Reels specs)
- **CaptionGenerator**: Genera captions con IA y hashtags relevantes
- **BatchProcessor**: Generacion diaria automatizada con manejo de errores
- **ThumbnailGenerator**: Extraccion de frames estaticos para preview

**Archivos:** `/Users/guillermo/code/claude/tests/infoslides/src/lib/models/video/ExportedVideo.js`

## Modelos de datos

El sistema define 12 modelos core con documentacion JSDoc completa:

### Slides y construccion
- **Slide** - Modelo de slide con validacion y metadatos
- **SlideBuilder** - Builder base abstracto
- **DialogueSlideBuilder** - Builder de slides de dialogo

### Contenido de dialogo
- **DialogueContent** - Conversacion completa entre speakers
- **Speaker** - Informacion de un speaker (avatares Kobe/Kanye incluidos)
- **Message** - Mensaje individual en un dialogo
- **CodeBlock** - Bloque de codigo con resaltado de sintaxis

### Instagram y redes sociales
- **InstagramMetadata** - Metadatos para Instagram Reels
- **Caption** - Captions con hashtags y categorias
- **Topic** - Topicos de contenido educativo

### Video y exportacion
- **VideoClip** - Segmento de video con propiedades temporales
- **FrameSequence** - Secuencia de frames para animaciones
- **CompositeOperation** - Operacion de composicion de video
- **ExportConfig** - Configuracion de exportacion (codec, bitrate, fps)
- **ExportedVideo** - Video final exportado con metadatos

**Ubicacion:** `/Users/guillermo/code/claude/tests/infoslides/src/lib/models/`

## Stack tecnologico

- **SvelteKit 5** - Framework con sintaxis moderna de runes para estado reactivo
- **JavaScript puro** - Sin TypeScript, prioriza simplicidad y accesibilidad
- **Integracion IA** - OpenAI GPT / Anthropic Claude para generacion de contenido
- **FFmpeg** - Composicion de video, codificacion y audio mixing
- **Tailwind CSS v4** - Estilos utility-first optimizados para Instagram Reels
- **html-to-image** - Generacion de thumbnails y exportacion de imagenes
- **Prism.js** - Resaltado de sintaxis para codigo Go
- **Vitest + Playwright** - Testing de componentes Svelte y logica de negocio

## Scripts de desarrollo

### Servidor de desarrollo
```bash
npm run dev              # Inicia servidor de desarrollo
npm run dev -- --open   # Inicia servidor y abre en navegador
```

### Build y preview
```bash
npm run build            # Crea build de produccion
npm run preview          # Preview del build de produccion
```

### Calidad de codigo
```bash
npm run lint             # Verifica linting (Prettier + ESLint)
npm run format           # Formatea codigo con Prettier
```

### Testing
```bash
npm run test             # Ejecuta todos los tests una vez
npm run test:unit        # Ejecuta tests en modo watch
```

### Documentacion
```bash
npm run docs:diagram     # Regenera diagramas HTML de Mermaid
```

## Solucion de problemas

### FFmpeg no encontrado

Si ves errores relacionados con FFmpeg:

```bash
# Verifica instalacion
ffmpeg -version

# Si no esta instalado, instala segun tu sistema operativo
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg
```

### API key de IA no configurada

El pipeline de generacion requiere una API key:

```bash
# Crea archivo .env en la raiz del proyecto
echo "OPENAI_API_KEY=tu-api-key-aqui" > .env

# O usa Claude
echo "ANTHROPIC_API_KEY=tu-api-key-aqui" > .env
```

### Slides no validan

Si un slide falla la validacion, revisa los errores:

```javascript
const slide = builder.getResult();

if (!slide.validation.isValid) {
  console.log('Errores:', slide.validation.errors);
  console.log('Advertencias:', slide.validation.warnings);
}
```

Errores comunes:
- Titulo vacio
- Contenido faltante
- Duracion de dialogo excede 90s (limite Instagram Reels)
- Aspect ratio incorrecto (debe ser 4:5 para Reels)

## Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guidelines de codigo

- Usa JavaScript puro (no TypeScript)
- Sigue los patrones de diseno existentes (Builder, Strategy, etc.)
- Agrega tests para nuevas funcionalidades
- Documenta con JSDoc
- Ejecuta `npm run lint` antes de commit

## Licencia

Este proyecto esta bajo la licencia MIT. Ver el archivo `LICENSE` para mas detalles.

## Recursos adicionales

- **[Creative Brief](./docs/CREATIVE_BRIEF.md)** - Estrategia de contenido Kobe/Kanye
- **[Architecture Assessment](./docs/ARCHITECTURE_ASSESSMENT.md)** - Roadmap de implementacion
- **[Sequence Diagram (Interactive)](./docs/sequence-diagram.html)** - Visualizacion del pipeline completo

---

Generado con pasion por codigo limpio y arquitectura extensible
