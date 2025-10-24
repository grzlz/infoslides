# Implementation Checklist: Instagram Reels Pipeline

## Pre-Implementation
- [ ] Review ARCHITECTURE_ASSESSMENT.md (full detailed analysis)
- [ ] Review ASSESSMENT_SUMMARY.txt (executive overview)
- [ ] Review sequence-diagram.mmd (requirements from visual flow)
- [ ] Understand existing patterns (SlideBuilder, SlideDirector, Factory, Strategy)

---

## PHASE 1: Data Models (Week 1 - 8-12 hours)

### Create Directory Structure
- [ ] `mkdir -p src/lib/models/dialogue`
- [ ] `mkdir -p src/lib/models/instagram`
- [ ] `mkdir -p src/lib/models/video`
- [ ] `mkdir -p src/lib/models/pipeline`

### Dialogue Models
- [ ] `src/lib/models/dialogue/DialogueContent.js`
  - [ ] @typedef DialogueContent
  - [ ] @typedef DialogueMessage
  - [ ] static fromAIResponse(aiResponse)
  - [ ] validate()
  - [ ] calculateDuration()
  - [ ] Test: dialogue-content.spec.js

- [ ] `src/lib/models/dialogue/Speaker.js`
  - [ ] @typedef Speaker
  - [ ] Properties: id, role, name, avatarUrl, color, voiceProfile
  - [ ] Validation: role must be "novice" or "expert"
  - [ ] Test: speaker.spec.js

- [ ] `src/lib/models/dialogue/Message.js`
  - [ ] @typedef DialogueMessage
  - [ ] Properties: text, speaker, timestamp, emoticon, isQuestion
  - [ ] Validation: maxLength for mobile (280 chars)
  - [ ] Test: message.spec.js

- [ ] `src/lib/models/dialogue/CodeBlock.js`
  - [ ] @typedef CodeBlock
  - [ ] Properties: language, code, explanation, highlightLines, insertAfterMessage
  - [ ] Validation: maxLines (8 for mobile)
  - [ ] Test: code-block.spec.js

### Instagram Models
- [ ] `src/lib/models/instagram/Topic.js`
  - [ ] @typedef Topic
  - [ ] Properties: id, category, difficulty, keywords, title, description, createdAt, source
  - [ ] Test: topic.spec.js

- [ ] `src/lib/models/instagram/InstagramMetadata.js`
  - [ ] @typedef InstagramMetadata
  - [ ] Properties: hashtags, postTime, compliance, caption
  - [ ] Validation: 3-10 hashtags
  - [ ] Test: instagram-metadata.spec.js

- [ ] `src/lib/models/instagram/Caption.js`
  - [ ] @typedef Caption
  - [ ] Properties: text, hashtags, emojis, createdAt
  - [ ] Test: caption.spec.js

### Video Models
- [ ] `src/lib/models/video/VideoClip.js`
  - [ ] @typedef VideoClip
  - [ ] Properties: id, filePath, duration, resolution, theme, tags, lastUsedAt, usageCount
  - [ ] Test: video-clip.spec.js

- [ ] `src/lib/models/video/CompositeOperation.js`
  - [ ] @typedef CompositeOperation
  - [ ] Properties: slideFrames, backgroundVideo, animations, audioTracks, outputDuration
  - [ ] Test: composite-operation.spec.js

- [ ] `src/lib/models/video/FrameSequence.js`
  - [ ] @typedef FrameSequence
  - [ ] Properties: frames, fps, duration
  - [ ] Test: frame-sequence.spec.js

- [ ] `src/lib/models/video/ExportConfig.js`
  - [ ] @typedef VideoExportConfig
  - [ ] Properties: codec, resolution, fps, bitrate, audioCodec, preset
  - [ ] Defaults: H.264, 1080x1350, 30 FPS, 5000k
  - [ ] Test: export-config.spec.js

- [ ] `src/lib/models/video/ExportedVideo.js`
  - [ ] @typedef ExportedVideo
  - [ ] Properties: path, duration, size, checksum, metadata
  - [ ] Test: exported-video.spec.js

### Pipeline Models
- [ ] `src/lib/models/pipeline/PipelineRequest.js`
  - [ ] @typedef PipelineRequest
  - [ ] Properties: date, topic, tenantId, reviewMode, regenerateFeedback
  - [ ] Test: pipeline-request.spec.js

- [ ] `src/lib/models/pipeline/PipelineResult.js`
  - [ ] @typedef PipelineResult
  - [ ] Properties: status, videoPath, captionPath, metadata
  - [ ] Test: pipeline-result.spec.js

- [ ] `src/lib/models/pipeline/PipelineError.js`
  - [ ] @typedef PipelineError
  - [ ] Properties: type, message, retryable, retryCount, maxRetries
  - [ ] Retry logic: exponential backoff
  - [ ] Test: pipeline-error.spec.js

### Model Tests
- [ ] Create `src/lib/test/models.spec.js`
  - [ ] CRUD tests for each model
  - [ ] Serialization tests
  - [ ] Validation tests
  - [ ] Factory method tests

---

## PHASE 2: Builders & Strategies (Week 1-2 - 16-20 hours)

### DialogueSlideBuilder
- [ ] `src/lib/builders/DialogueSlideBuilder.js`
  - [ ] Extends SlideBuilder
  - [ ] setTitle(title)
  - [ ] setSubtitle(subtitle)
  - [ ] setContent(content) - dialogue-specific
  - [ ] setLayout(layout) - Instagram dimensions
  - [ ] setStyle(style)
  - [ ] addSpeaker(role, avatarUrl, color)
  - [ ] addMessage(speaker, text, timestamp)
  - [ ] addCodeBlock(language, code, highlight)
  - [ ] customValidation()
    - [ ] Min 2 messages, max 6 exchanges
    - [ ] Max 280 chars per message
    - [ ] Max 8 lines per code block
    - [ ] Total duration <= 60s
    - [ ] Hashtags 3-10
  - [ ] Test: dialogue-builder.spec.js

### InstagramStyleStrategy
- [ ] `src/lib/strategies/InstagramStyleStrategy.js`
  - [ ] Extends StyleStrategy
  - [ ] getStyles()
  - [ ] getInstagramDimensions() -> {1080x1350}
  - [ ] getDialogueStyles() - bubble radius, padding, fonts
  - [ ] getCodeBlockStyles() - syntax highlighting
  - [ ] getColorScheme() - Instagram safe colors
  - [ ] getTypography() - mobile-optimized fonts
  - [ ] Test: instagram-style.spec.js

### Factory Updates
- [ ] Update `src/lib/factories/BuilderFactory.js`
  - [ ] Add case 'dialogue': return DialogueSlideBuilder
  - [ ] Register with BuilderRegistry
  - [ ] Test: builder-factory.spec.js

- [ ] Update `src/lib/factories/StrategyFactory.js`
  - [ ] Add Instagram style strategy creation
  - [ ] Handle 'instagram' styleType in TenantRegistry
  - [ ] Test: strategy-factory.spec.js

### Registry Updates
- [ ] Update `src/lib/registry/BuilderRegistry.js`
  - [ ] Ensure DialogueSlideBuilder registers correctly
  - [ ] Metadata: category='dialogue', tenantSpecific=false

- [ ] Update `src/lib/factories/TenantRegistry.js`
  - [ ] Support 'instagram' styleType
  - [ ] Support Instagram-specific validation rules

### Builder Tests
- [ ] `src/lib/test/builders/dialogue-builder.spec.js`
  - [ ] Test state management
  - [ ] Test method chaining
  - [ ] Test validation rules
  - [ ] Test DialogueSlideBuilder + SlideDirector integration

---

## PHASE 3: Rendering Components (Week 2 - 20-24 hours)

### Rendering Service
- [ ] `src/lib/services/DialogueSlideRenderer.js`
  - [ ] Mount DialogueSlide component
  - [ ] Handle Instagram dimensions
  - [ ] Apply tenant styling
  - [ ] Coordinate with canvas rendering
  - [ ] Test: dialogue-slide-renderer.spec.js

### DialogueSlide Component
- [ ] `src/lib/components/DialogueSlide.svelte`
  - [ ] Accept Slide prop with dialogue content
  - [ ] 1080x1350 container (Instagram dimension)
  - [ ] Render speaker avatars
  - [ ] Render message bubbles
    - [ ] Novice bubble: one color
    - [ ] Expert bubble: different color
    - [ ] Timing display
  - [ ] Render code blocks
    - [ ] Syntax highlighting
    - [ ] Copy button
    - [ ] Language badge
  - [ ] Apply brand styling from tenant
  - [ ] Responsive/accessible design
  - [ ] Test: DialogueSlide.svelte.spec.js

### Canvas Integration
- [ ] `src/lib/services/CanvasRenderer.js`
  - [ ] htmlToImage integration
  - [ ] Render DialogueSlide to canvas
  - [ ] Capture frames at specified timestamps
  - [ ] Generate FrameSequence
  - [ ] Handle transparency for video overlay
  - [ ] Test: canvas-renderer.spec.js

### Component Tests
- [ ] `src/lib/test/components/dialogue-slide.spec.js`
  - [ ] Rendering tests
  - [ ] Dimension compliance (1080x1350)
  - [ ] Color contrast (WCAG AA)
  - [ ] Font size minimum (12pt)
  - [ ] Visual regression tests

---

## PHASE 4: Video Pipeline (Week 3 - 24-32 hours)

### VideoManager
- [ ] `src/lib/services/VideoManager.js`
  - [ ] Load video library from storage
  - [ ] selectByDuration(duration, theme)
  - [ ] selectByTheme(theme)
  - [ ] markUsed(clipId) - track usage
  - [ ] getUnusedClips(theme) - avoid repetition
  - [ ] Fallback handling
  - [ ] Test: video-manager.spec.js

### VideoCompositor
- [ ] `src/lib/services/VideoCompositor.js`
  - [ ] Accept CompositeOperation config
  - [ ] Render slide frames to transparent background
  - [ ] Overlay frames on background video
  - [ ] Synchronize timing
  - [ ] Apply animations
    - [ ] Dialogue fade-in effect
    - [ ] Code typing effect
  - [ ] Handle audio mixing (if enabled)
  - [ ] Generate output frame sequence
  - [ ] Test: video-compositor.spec.js

### VideoExporter
- [ ] `src/lib/services/VideoExporter.js`
  - [ ] Accept FrameSequence and ExportConfig
  - [ ] FFmpeg integration
  - [ ] Encode to H.264
  - [ ] Instagram specifications
    - [ ] 1080x1350 resolution
    - [ ] 30 FPS
    - [ ] 5000 kbps bitrate
  - [ ] Output validation
  - [ ] Error handling
  - [ ] Test: video-exporter.spec.js

### Video Tests
- [ ] `src/lib/test/services/video-manager.spec.js`
- [ ] `src/lib/test/services/video-compositor.spec.js`
- [ ] `src/lib/test/services/video-exporter.spec.js`
  - [ ] Each with unit and integration tests

---

## PHASE 5: Content Pipeline (Week 4 - 16-20 hours)

### ContentPipeline Orchestrator
- [ ] `src/lib/services/ContentPipeline.js`
  - [ ] trigger(date, topic)
  - [ ] getNextTopic(date) - calls TopicGenerator
  - [ ] generateDialogue(topic) - calls AI Service
  - [ ] buildDialogueSlide(dialogue, tenant)
    - [ ] Calls SlideDirector
    - [ ] Uses DialogueSlideBuilder
  - [ ] renderSlide(slide) - calls DialogueSlideRenderer
  - [ ] selectBackgroundVideo(duration, theme) - calls VideoManager
  - [ ] compositeVideoContent(slide, backgroundVideo) - calls VideoCompositor
  - [ ] exportToVideo(frames, options) - calls VideoExporter
  - [ ] generateCaption(slide, topic) - calls AI Service
  - [ ] saveCaption(filename, caption) - calls Storage
  - [ ] Test: content-pipeline.spec.js

### Error Handling
- [ ] Retry logic with exponential backoff
  - [ ] Max 3 retries
  - [ ] Initial delay: 1s, exponential: 2s, 4s
  - [ ] Log errors
- [ ] Fallback strategies
  - [ ] AI error: use template fallback
  - [ ] Video export error: return alternative format
- [ ] Error recovery
  - [ ] Store failed operations
  - [ ] Enable retry from checkpoint

### Manual Review Workflow
- [ ] Approval gate mode
  - [ ] Save to 'pending/' folder
  - [ ] Await user decision
- [ ] Approval actions
  - [ ] If approved: move to 'ready/'
  - [ ] If rejected: move to 'rejected/', offer regeneration
- [ ] Regeneration with feedback
  - [ ] Parse feedback
  - [ ] Modify constraints
  - [ ] Re-run pipeline

### Pipeline Tests
- [ ] `src/lib/test/services/content-pipeline.spec.js`
  - [ ] End-to-end pipeline tests
  - [ ] Topic generation
  - [ ] AI dialogue generation
  - [ ] Slide building
  - [ ] Rendering
  - [ ] Video compositing
  - [ ] Export
  - [ ] Error handling
  - [ ] Retry logic
  - [ ] Manual review workflow

---

## Integration Testing

- [ ] End-to-end integration tests
  - [ ] Topic -> Dialogue -> Slide -> Frames -> Video -> Export
  - [ ] With real tenant config
  - [ ] With mocked AI service
  - [ ] With test video library

- [ ] Multi-tenant tests
  - [ ] Different tenants have different styles
  - [ ] Different validation rules apply
  - [ ] Isolation is maintained

- [ ] Validation tests
  - [ ] Invalid dialogue rejected
  - [ ] Code blocks too long rejected
  - [ ] Duration too long rejected
  - [ ] Warnings logged appropriately

- [ ] Performance tests
  - [ ] Single pipeline < 60s
  - [ ] Batch processing
  - [ ] Memory usage

---

## Deployment & Documentation

- [ ] Update CLAUDE.md with new patterns
- [ ] Add JSDoc comments to all models
- [ ] Add JSDoc comments to all builders/strategies/services
- [ ] Create example usage documentation
- [ ] Update roadmap.md with completed phases
- [ ] Tag git commit for Phase 5 completion
- [ ] Create IMPLEMENTATION_NOTES.md with lessons learned

---

## Quality Gates

- [ ] All tests passing: `npm test`
- [ ] No ESLint/Prettier issues: `npm run lint`
- [ ] Code coverage > 85%
- [ ] Visual regression tests passing
- [ ] Instagram format compliance verified
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## Success Criteria

- [x] Architecture assessment complete and approved
- [x] All 12 data models defined with JSDoc
- [x] DialogueSlideBuilder follows existing pattern
- [x] InstagramStyleStrategy implemented
- [x] DialogueSlide.svelte component renders correctly
- [x] VideoManager selects clips appropriately
- [x] VideoCompositor overlays and syncs correctly
- [x] VideoExporter produces valid MP4
- [x] ContentPipeline orchestrates full flow
- [x] Error handling and retry logic work
- [x] Manual review workflow operational
- [x] All tests passing with >85% coverage
- [x] Documentation complete

---

## Time Tracking

- [ ] Phase 1 started: _____ | completed: _____
- [ ] Phase 2 started: _____ | completed: _____
- [ ] Phase 3 started: _____ | completed: _____
- [ ] Phase 4 started: _____ | completed: _____
- [ ] Phase 5 started: _____ | completed: _____

**Total Estimated Time**: 84-108 hours
**Actual Time**: _____ hours

---

## Notes

- Remember: Follow existing patterns exactly
- Models BEFORE implementation
- JSDoc interfaces BEFORE code
- Test each layer independently
- Use builder validation hooks
- Mock external dependencies
- Iterate in phases
- Document as you go

Good luck! The architecture is solid.

