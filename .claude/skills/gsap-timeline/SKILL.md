---
name: gsap-timeline
description: Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. Use when sequencing animations, choreographing keyframes, or when the user asks about animation sequencing, timelines, or animation order.
license: MIT
---

# GSAP Timeline

## Creating a Timeline

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 })
  .to(".c", { opacity: 0 });
```

## Position Parameter (3rd argument)

| Syntax | Meaning |
|--------|---------|
| `0` | Absolute: at 0s |
| `"+=0.5"` | 0.5s after previous end |
| `"-=0.2"` | 0.2s before previous end |
| `"<"` | Same start as previous tween |
| `"<0.2"` | 0.2s after previous start |
| `"labelName"` | At that label |

```javascript
tl.to(".a", { x: 100 }, 0)
  .to(".b", { y: 50 }, "+=0.5")
  .to(".c", { opacity: 0 }, "<")      // same time as .b
  .to(".d", { scale: 2 }, "<0.2");    // 0.2s after .c start
```

## Timeline Options

```javascript
gsap.timeline({
  paused: true,           // start paused
  repeat: -1,             // infinite
  yoyo: true,
  defaults: { duration: 0.5, ease: "power2.out" },
  onComplete: () => {}
});
```

## Labels

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");
tl.addLabel("outro", "+=0.5");
tl.play("outro");
```

## Playback Control

```javascript
tl.play() / tl.pause() / tl.reverse() / tl.restart()
tl.time(2)        // seek to 2s
tl.progress(0.5)  // seek to 50%
tl.kill()
```

## Best Practices

- ✅ Prefer timelines over chaining animations with `delay`
- ✅ Use position parameter for precise timing
- ✅ Pass `defaults` to avoid repeating duration/ease per tween
- ✅ Put ScrollTrigger on the timeline, not on child tweens

## Do Not

- ❌ Use `delay` for sequencing — use timeline position parameter
- ❌ Nest ScrollTriggered animations inside parent timelines

https://gsap.com/docs/v3/GSAP/gsap.timeline()/
