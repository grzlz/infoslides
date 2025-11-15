# Liquid Glass UI - Implementation Guide

## Overview

The dialogue interface now features **liquid glass morphism** - a premium visual effect perfect for Instagram Reels that combines multiple backdrop-filter layers for a frosted, translucent appearance.

## What's Been Implemented

### GlassContainer Component
`src/lib/components/GlassContainer.svelte`

A reusable Svelte 5 component that creates the liquid glass effect using:

**7 Layered Effects:**
1. **Edge Reflection** - Bright rim around the container
2. **Emboss Reflection** - 3D depth effect
3. **Refraction** - Light bending simulation
4. **Blur** - Background blur for frosted glass
5. **Blend Layers** - Smooth color blending
6. **Blend Edge** - Edge softening
7. **Highlight** - Specular highlights

**Customizable Properties:**
```javascript
{
  cornerRadius: '24px',
  baseStrength: '12px',
  extraBlur: '3px',
  softness: '10px',
  invert: '5%',
  brightness: 1.1,
  contrast: 1.2
}
```

### DialogueBubble Component
`src/lib/components/DialogueBubble.svelte`

Speaker-specific glass-styled dialogue bubbles with:

**Kobe Bryant (Expert):**
- Lakers Purple background: `rgba(85, 37, 131, 0.4)`
- Gold text: `#FDB927`
- Moderate glass effect (12px blur)
- Professional, clean styling

**Kanye West (Novice):**
- Black background: `rgba(0, 0, 0, 0.6)`
- White text: `#FFFFFF`
- Enhanced glass for interruptions (16px blur)
- Chaotic, bold styling with shake animation

**Features:**
- Slide-in animations on appearance
- Shake animation for interruptions
- Pulsing flame emoji (🔥) for interruption marker
- Code block support with nested frosted glass
- Responsive mobile optimization

## How to Use

### In Test Interface (`/test-ai`)

1. **Generate a dialogue** using any topic
2. **Toggle Glass Mode** to see the effect
3. **Compare** with Classic View

### In Your Own Components

```svelte
<script>
  import DialogueBubble from '$lib/components/DialogueBubble.svelte';
  import { Speaker } from '$lib/models/dialogue/Speaker.js';
</script>

<DialogueBubble
  speaker={Speaker.createKobeBryant()}
  message="Go's concurrency model is like the triangle offense..."
  isInterruption={false}
  timestamp={0}
  animated={true}
/>
```

### Custom Glass Container

```svelte
<script>
  import GlassContainer from '$lib/components/GlassContainer.svelte';
</script>

<GlassContainer
  cornerRadius="32px"
  baseStrength="16px"
  brightness={1.2}
>
  <div style="padding: 2rem; background: rgba(255,255,255,0.1);">
    Your content here
  </div>
</GlassContainer>
```

## Visual Examples

### Glass Mode Background
The test interface uses a gradient background to showcase the glass effect:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

With a subtle grid pattern overlay for depth perception.

### Speaker Color Schemes

**Kobe (Purple & Gold):**
- Professional, measured tone
- Clean edges, moderate blur
- Text shadow for readability on gradient backgrounds

**Kanye (Black & White):**
- Bold, high contrast
- Increased blur on interruptions
- Dramatic shake animation

## Technical Implementation

### CSS Backdrop Filters
The effect uses multiple `backdrop-filter` layers:

```css
backdrop-filter:
  blur(14px)           /* Base frosting */
  brightness(1.2)      /* Light boost */
  saturate(1.2)        /* Color pop */
  contrast(1.5)        /* Edge definition */
  invert(0.1)          /* Subtle color shift */
```

### Mask Compositing
Creates the layered edges using CSS masks:

```css
mask:
  linear-gradient(white 0 0) padding-box,
  linear-gradient(white 0 0) content-box;
mask-composite: exclude;
```

### Performance Considerations
- Uses `will-change: backdrop-filter` sparingly
- Avoids excessive nesting (max 7 layers)
- Optimized for 30fps video rendering
- Mobile-tested on Instagram Reels dimensions (1080x1350)

## Browser Support

**Fully Supported:**
- Chrome 76+ ✅
- Edge 79+ ✅
- Safari 9+ ✅
- Firefox 103+ ✅

**Fallback:**
- Older browsers show solid backgrounds with border instead

## Integration with Video Pipeline

### Phase 3: Frame Rendering
When we implement `html-to-image` capture:

1. DialogueBubble renders with glass effect
2. Background gradient provides depth
3. Frame captured as PNG (1080x1350)
4. Sequence of frames exported

### Phase 4: Video Compositing
Glass bubbles overlaid on Minecraft parkour background:

```javascript
compositeOp.overlays.push({
  type: 'html',
  content: '<DialogueBubble ...>',
  position: { x: 0, y: 0, width: 1080, height: 1350 },
  startTime: message.timestamp,
  endTime: message.timestamp + readingTime
});
```

The glass effect creates visual separation from busy video backgrounds.

## Customization Tips

### Adjust Glass Strength
For different background intensities:

```javascript
// Subtle glass (busy backgrounds)
<GlassContainer baseStrength="8px" extraBlur="2px" />

// Strong glass (simple backgrounds)
<GlassContainer baseStrength="20px" extraBlur="5px" />
```

### Color Tinting
Apply colored tints to the glass:

```javascript
<GlassContainer
  tintHue="280deg"      // Purple tint
  tintSaturation={1.5}
  brightness={1.1}
/>
```

### Animation Timing
Sync with dialogue timestamps:

```javascript
animation-delay: {message.timestamp}ms;
animation-duration: 400ms;
```

## Testing Checklist

- [x] Glass effect visible on gradient background
- [x] Toggle between Glass/Classic modes
- [x] Kobe bubbles have purple/gold styling
- [x] Kanye bubbles have black/white styling
- [x] Interruptions trigger shake animation
- [x] Code blocks render with nested glass
- [x] Mobile responsive (480px width)
- [x] Animations smooth at 30fps
- [ ] Frame capture preserves glass effect (Phase 3)
- [ ] Compositing works over video background (Phase 4)

## Next Steps

1. **Test with real API key** - Generate actual Kobe/Kanye dialogues
2. **Iterate on glass strength** - Tune for readability
3. **Add background music visualizer** - Subtle audio reactivity
4. **Implement Phase 3** - html-to-image frame capture
5. **Test compositing** - Overlay on Minecraft parkour clips

## Inspiration & References

This implementation is based on modern glassmorphism trends seen in:
- iOS 15+ system UI
- macOS Big Sur+ windows
- Instagram Stories overlays
- TikTok video effects

The multi-layer approach provides more realistic refraction than single `backdrop-filter` implementations.

---

**View live**: Start dev server → http://localhost:5173/test-ai → Toggle Glass Mode ✨
