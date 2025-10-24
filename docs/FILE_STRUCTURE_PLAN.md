# File Structure Plan: Instagram Reels Pipeline

## Current Structure (Existing)

```
src/lib/
├── models/
│   └── Slide.js                        ✅ EXISTING
├── builders/
│   ├── TextSlideBuilder.js             ✅ EXISTING
│   └── ChartSlideBuilder.js            ✅ EXISTING
├── patterns/
│   ├── SlideBuilder.js                 ✅ EXISTING (abstract base)
│   └── SlideDirector.js                ✅ EXISTING (orchestrator)
├── strategies/
│   ├── StyleStrategy.js                ✅ EXISTING (abstract base)
│   └── LayoutStrategy.js               ✅ EXISTING (abstract base)
├── factories/
│   ├── BuilderFactory.js               ✅ EXISTING
│   ├── StrategyFactory.js              ✅ EXISTING
│   └── TenantRegistry.js               ✅ EXISTING
├── registry/
│   └── BuilderRegistry.js              ✅ EXISTING
├── test/
│   └── core-patterns.test.js           ✅ EXISTING
└── SlideEngine.js                      ✅ EXISTING (main engine)
```

**Total Files**: 14
**Models**: 1

---

## Target Structure (After Implementation)

```
src/lib/
├── models/
│   ├── Slide.js                        ✅ EXISTING
│   ├── dialogue/                       ❌ NEW DIRECTORY
│   │   ├── DialogueContent.js          ❌ NEW
│   │   ├── Speaker.js                  ❌ NEW
│   │   ├── Message.js                  ❌ NEW
│   │   └── CodeBlock.js                ❌ NEW
│   ├── instagram/                      ❌ NEW DIRECTORY
│   │   ├── Topic.js                    ❌ NEW
│   │   ├── InstagramMetadata.js        ❌ NEW
│   │   └── Caption.js                  ❌ NEW
│   ├── video/                          ❌ NEW DIRECTORY
│   │   ├── VideoClip.js                ❌ NEW
│   │   ├── CompositeOperation.js       ❌ NEW
│   │   ├── FrameSequence.js            ❌ NEW
│   │   ├── ExportConfig.js             ❌ NEW
│   │   └── ExportedVideo.js            ❌ NEW
│   └── pipeline/                       ❌ NEW DIRECTORY
│       ├── PipelineRequest.js          ❌ NEW
│       ├── PipelineResult.js           ❌ NEW
│       └── PipelineError.js            ❌ NEW
│
├── builders/
│   ├── TextSlideBuilder.js             ✅ EXISTING
│   ├── ChartSlideBuilder.js            ✅ EXISTING
│   └── DialogueSlideBuilder.js         ❌ NEW
│
├── patterns/
│   ├── SlideBuilder.js                 ✅ EXISTING
│   └── SlideDirector.js                ✅ EXISTING
│
├── strategies/
│   ├── StyleStrategy.js                ✅ EXISTING
│   ├── LayoutStrategy.js               ✅ EXISTING
│   └── InstagramStyleStrategy.js       ❌ NEW
│
├── factories/
│   ├── BuilderFactory.js               ✅ EXISTING (UPDATE)
│   ├── StrategyFactory.js              ✅ EXISTING (UPDATE)
│   └── TenantRegistry.js               ✅ EXISTING (UPDATE)
│
├── registry/
│   └── BuilderRegistry.js              ✅ EXISTING
│
├── services/                           ❌ NEW DIRECTORY
│   ├── DialogueSlideRenderer.js        ❌ NEW
│   ├── CanvasRenderer.js               ❌ NEW
│   ├── VideoManager.js                 ❌ NEW
│   ├── VideoCompositor.js              ❌ NEW
│   ├── VideoExporter.js                ❌ NEW
│   └── ContentPipeline.js              ❌ NEW
│
├── components/                         ❌ NEW DIRECTORY
│   └── DialogueSlide.svelte            ❌ NEW
│
├── test/
│   ├── core-patterns.test.js           ✅ EXISTING
│   ├── models.spec.js                  ❌ NEW
│   ├── models/                         ❌ NEW DIRECTORY
│   │   ├── dialogue-content.spec.js    ❌ NEW
│   │   ├── speaker.spec.js             ❌ NEW
│   │   ├── message.spec.js             ❌ NEW
│   │   ├── code-block.spec.js          ❌ NEW
│   │   ├── topic.spec.js               ❌ NEW
│   │   ├── instagram-metadata.spec.js  ❌ NEW
│   │   ├── caption.spec.js             ❌ NEW
│   │   ├── video-clip.spec.js          ❌ NEW
│   │   ├── composite-operation.spec.js ❌ NEW
│   │   ├── frame-sequence.spec.js      ❌ NEW
│   │   ├── export-config.spec.js       ❌ NEW
│   │   ├── exported-video.spec.js      ❌ NEW
│   │   ├── pipeline-request.spec.js    ❌ NEW
│   │   ├── pipeline-result.spec.js     ❌ NEW
│   │   └── pipeline-error.spec.js      ❌ NEW
│   ├── builders/                       ❌ NEW DIRECTORY
│   │   └── dialogue-builder.spec.js    ❌ NEW
│   ├── strategies/                     ❌ NEW DIRECTORY
│   │   └── instagram-style.spec.js     ❌ NEW
│   ├── services/                       ❌ NEW DIRECTORY
│   │   ├── dialogue-slide-renderer.spec.js    ❌ NEW
│   │   ├── canvas-renderer.spec.js            ❌ NEW
│   │   ├── video-manager.spec.js              ❌ NEW
│   │   ├── video-compositor.spec.js           ❌ NEW
│   │   ├── video-exporter.spec.js             ❌ NEW
│   │   └── content-pipeline.spec.js           ❌ NEW
│   └── components/                     ❌ NEW DIRECTORY
│       └── DialogueSlide.svelte.spec.js       ❌ NEW
│
├── SlideEngine.js                      ✅ EXISTING
└── index.js                            ✅ EXISTING
```

**Total Files**: 14 existing + 50 new = 64 files
**Models**: 1 existing + 12 new = 13 models
**Builders**: 2 existing + 1 new = 3 builders
**Strategies**: 2 existing + 1 new = 3 strategies
**Services**: 0 existing + 6 new = 6 services
**Components**: 0 existing + 1 new = 1 component
**Tests**: 1 existing + 24 new = 25 tests

---

## Breakdown by Phase

### PHASE 1: Data Models (8-12 hours)
**New Files**: 25 (12 models + 13 tests)
```
src/lib/models/
├── dialogue/
│   ├── DialogueContent.js
│   ├── Speaker.js
│   ├── Message.js
│   └── CodeBlock.js
├── instagram/
│   ├── Topic.js
│   ├── InstagramMetadata.js
│   └── Caption.js
├── video/
│   ├── VideoClip.js
│   ├── CompositeOperation.js
│   ├── FrameSequence.js
│   ├── ExportConfig.js
│   └── ExportedVideo.js
└── pipeline/
    ├── PipelineRequest.js
    ├── PipelineResult.js
    └── PipelineError.js

src/lib/test/models/
├── dialogue-content.spec.js
├── speaker.spec.js
├── message.spec.js
├── code-block.spec.js
├── topic.spec.js
├── instagram-metadata.spec.js
├── caption.spec.js
├── video-clip.spec.js
├── composite-operation.spec.js
├── frame-sequence.spec.js
├── export-config.spec.js
├── exported-video.spec.js
├── pipeline-request.spec.js
├── pipeline-result.spec.js
└── pipeline-error.spec.js
```

### PHASE 2: Builders & Strategies (16-20 hours)
**New Files**: 5 (3 implementation + 2 tests)
```
src/lib/builders/
└── DialogueSlideBuilder.js

src/lib/strategies/
└── InstagramStyleStrategy.js

src/lib/test/builders/
└── dialogue-builder.spec.js

src/lib/test/strategies/
└── instagram-style.spec.js

Updated Files:
├── src/lib/factories/BuilderFactory.js (update)
├── src/lib/factories/StrategyFactory.js (update)
└── src/lib/factories/TenantRegistry.js (update)
```

### PHASE 3: Rendering Components (20-24 hours)
**New Files**: 5 (3 implementation + 2 tests)
```
src/lib/services/
├── DialogueSlideRenderer.js
└── CanvasRenderer.js

src/lib/components/
└── DialogueSlide.svelte

src/lib/test/services/
├── dialogue-slide-renderer.spec.js
└── canvas-renderer.spec.js

src/lib/test/components/
└── DialogueSlide.svelte.spec.js
```

### PHASE 4: Video Pipeline (24-32 hours)
**New Files**: 6 (3 implementation + 3 tests)
```
src/lib/services/
├── VideoManager.js
├── VideoCompositor.js
└── VideoExporter.js

src/lib/test/services/
├── video-manager.spec.js
├── video-compositor.spec.js
└── video-exporter.spec.js
```

### PHASE 5: Content Pipeline (16-20 hours)
**New Files**: 2 (1 implementation + 1 test)
```
src/lib/services/
└── ContentPipeline.js

src/lib/test/services/
└── content-pipeline.spec.js
```

---

## File Creation Order

```
WEEK 1: Phase 1 & Start Phase 2
├── Day 1-2: Create dialogue models (4 files)
├── Day 2-3: Create instagram models (3 files)
├── Day 3-4: Create video models (5 files)
├── Day 4-5: Create pipeline models (3 files)
├── Day 5-6: Create all model tests (13 files)
├── Day 6-7: Implement DialogueSlideBuilder
└── Day 7: Implement InstagramStyleStrategy

WEEK 2: Phase 2 Continued & Phase 3
├── Day 1-2: Update factories and strategies
├── Day 2-3: Implement DialogueSlideRenderer
├── Day 3-5: Implement DialogueSlide.svelte
├── Day 5-6: Implement CanvasRenderer
└── Day 6-7: Create rendering tests

WEEK 3: Phase 4
├── Day 1-2: Implement VideoManager
├── Day 2-4: Implement VideoCompositor
├── Day 4-5: Implement VideoExporter
└── Day 5-7: Create video pipeline tests

WEEK 4: Phase 5 & Testing
├── Day 1-2: Implement ContentPipeline
├── Day 2-4: Error handling and retry logic
├── Day 4-5: Manual review workflow
├── Day 5-7: End-to-end testing and fixes
```

---

## Key Numbers

| Category | Count |
|----------|-------|
| Total New Files | 50 |
| New Models | 12 |
| New Builders | 1 |
| New Strategies | 1 |
| New Services | 6 |
| New Components | 1 |
| New Tests | 24 |
| Updated Files | 3 |
| New Directories | 8 |
| Total Test Coverage | ~85% |

---

## Dependencies Between Files

```
Models (Phase 1)
  └── DialogueContent.js
      └── Speaker.js, Message.js, CodeBlock.js
      └── Topic.js, InstagramMetadata.js, Caption.js
      └── VideoClip.js, FrameSequence.js, etc.
      └── PipelineRequest.js, PipelineResult.js, PipelineError.js

Builders (Phase 2)
  └── DialogueSlideBuilder.js
      ├── depends on: Slide.js (EXISTING)
      ├── depends on: SlideBuilder.js (EXISTING)
      ├── depends on: Speaker.js, Message.js, CodeBlock.js (Phase 1)
      └── depends on: Validation models (Phase 1)

Strategies (Phase 2)
  └── InstagramStyleStrategy.js
      ├── depends on: StyleStrategy.js (EXISTING)
      └── depends on: InstagramMetadata.js (Phase 1)

Services (Phase 3-4)
  ├── DialogueSlideRenderer.js
  │   ├── depends on: DialogueSlide.svelte (Phase 3)
  │   └── depends on: DialogueSlideBuilder (Phase 2)
  ├── VideoManager.js
  │   └── depends on: VideoClip.js (Phase 1)
  ├── VideoCompositor.js
  │   ├── depends on: CompositeOperation.js (Phase 1)
  │   └── depends on: FrameSequence.js (Phase 1)
  └── VideoExporter.js
      ├── depends on: ExportConfig.js (Phase 1)
      └── depends on: ExportedVideo.js (Phase 1)

Pipeline (Phase 5)
  └── ContentPipeline.js
      ├── depends on: SlideDirector.js (EXISTING)
      ├── depends on: DialogueSlideBuilder (Phase 2)
      ├── depends on: VideoManager.js (Phase 4)
      ├── depends on: VideoCompositor.js (Phase 4)
      ├── depends on: VideoExporter.js (Phase 4)
      └── depends on: All models (Phase 1)
```

---

## Pre-Implementation Checklist

Before starting file creation:

- [ ] Review existing SlideBuilder pattern
- [ ] Review existing SlideDirector pattern
- [ ] Review existing TextSlideBuilder as template
- [ ] Review existing StyleStrategy pattern
- [ ] Understand TenantRegistry structure
- [ ] Understand BuilderFactory pattern
- [ ] Review test structure in core-patterns.test.js
- [ ] Ensure test setup with Vitest is ready
- [ ] Have sequence-diagram.mmd open for reference

---

## Git Commit Strategy

```
After Phase 1:  "Add dialogue, instagram, video, pipeline data models"
After Phase 2:  "Add DialogueSlideBuilder and InstagramStyleStrategy"
After Phase 3:  "Add DialogueSlide rendering and canvas integration"
After Phase 4:  "Add video pipeline (manager, compositor, exporter)"
After Phase 5:  "Add ContentPipeline orchestration"
After Testing:  "Complete Instagram Reels pipeline implementation"
```

---

## Notes for Implementation

1. **Order Matters**: Don't skip Phase 1. Models define the contracts.
2. **JSDoc First**: Write @typedef and @property before implementation
3. **Follow Patterns**: Copy TextSlideBuilder structure exactly for DialogueSlideBuilder
4. **Test Early**: Create tests alongside implementation, not after
5. **One Phase at a Time**: Complete and test one phase before starting the next
6. **Integration Points**: When phase complete, ensure it integrates with existing code
7. **Documentation**: Comment code as you write it

---

