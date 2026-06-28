# Animation Reference Method

This project uses movement references to understand motion, then creates original, editable pose data. References are not copied into generated assets or treated as training data by default.

## Two complementary sources

### Observed motion: Eadweard Muybridge

The [Wikimedia Commons collection of Muybridge human animations](https://commons.wikimedia.org/wiki/Category:Eadward_Muybridge_animations_of_humans) contains sequential studies of walking, running, jumping, climbing stairs, carrying weight, boxing, fencing, and other actions.

Use these studies to analyse:

- phase order and limb trajectories;
- which foot supports the body;
- centre-of-mass rise, fall, and forward travel;
- stride length and joint compression;
- action-specific balance and recovery;
- where loops can join cleanly.

The collection page currently lists dozens of separate media files. Each file has its own description and licence information. Verify that file-level licence before incorporating any media. Prefer extracting original skeletal observations over bundling source imagery.

### Authored motion: Richard Williams

Richard Williams' *The Animator's Survival Kit* is a useful conceptual reference for:

- timing versus spacing;
- keys, extremes, breakdowns, and in-betweens;
- contact, down, passing, and up positions;
- weight, counteraction, overlap, and arcs;
- anticipation, accents, and recovery;
- readable silhouettes and profiles.

The book should be treated as a copyrighted reference. Do not reproduce its diagrams or substantial text in this repository. Encode learned general principles in original templates and implementation rules.

## Pose-template requirements

Each animation template should eventually store:

```json
{
  "id": "generic.walk.side.v1",
  "direction": "side",
  "loop": true,
  "baseline": 284,
  "pivot": { "x": 160, "y": 284 },
  "frames": [
    {
      "phase": "contact",
      "durationMs": 100,
      "support": "left",
      "contacts": ["leftFoot"],
      "joints": {},
      "arcs": {},
      "notes": ""
    }
  ]
}
```

Joint positions alone describe where the body is, but not how the motion should feel. Per-frame duration, support, contacts, phase, and motion arcs make the template useful for generation and validation.

## Template creation workflow

1. Choose a movement and collect legally usable observation references.
2. Identify the action's keys, extremes, contacts, and breakdowns.
3. Plot the pelvis and head trajectory before arranging the limbs.
4. Mark support feet, hand contacts, props, and the shared baseline.
5. Create an original canonical skeleton sequence.
6. Preview at several frame rates and adjust timing independently of pose count.
7. Check arcs, balance, silhouette, foot sliding, and loop continuity.
8. Test the sequence against multiple character proportions.
9. Save it as a versioned template with source notes and licence notes.
10. Keep every joint editable in the browser mapping interface.

## Planned schema extensions

The current prototype supports one humanoid skeleton. Later actions require:

- prop anchors and orientation for rifles, tools, telephones, and grenades;
- a second skeleton for rescue, carry, and drag actions;
- hand and foot contact constraints;
- facing direction and directional variants;
- per-frame timing controls;
- motion arcs and onion-skin overlays;
- confidence or validation warnings for implausible limb lengths and foot sliding.

## Initial research priorities

1. Refine walk and run using contact/down/passing/up phases.
2. Refine jump using anticipation/take-off/apex/descent/landing.
3. Add climb with hand and foot contact constraints.
4. Add carry and lift using centre-of-mass and weight-shift studies.
5. Expand the schema for rifle and tool anchor points.

