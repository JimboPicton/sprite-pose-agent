# Sprite Pose Agent

A web-based foundation for turning one supplied character image into coherent animation frames and exportable sprite sheets.

The first prototype focuses on the core workflow: upload a character, choose an animation template, adjust its canonical skeletons over the reference, preview timing, and export a sprite sheet plus structured metadata. The initial library includes idle, walk, run, jump, crouch, crawl, hurt, death, and get-up sequences. Prop-heavy and multi-character WW1 motion will arrive later as richer optional pose packs.

## Run the prototype

No installation or build step is required.

1. Open `index.html` directly in a modern browser, or serve this directory with any static web server.
2. Upload a PNG, WEBP, or JPG character reference.
3. Build and preview the walk animation plan.
4. Select a frame and drag its pose joints over the character reference.
5. Use **Apply fit forward** to carry that frame's fitting offsets into all subsequent frames while preserving their motion.
6. Export the edited pose-study sheet or JSON metadata.

The current renderer is intentionally a pose-study mock. It establishes the interaction, editable joint mapping, template schema, baseline, pivot, playback, and export pipeline before an AI image provider is connected.

## Release identification

The current release number is shown in the page header, browser title, and footer. `version.json` is the source of truth when the app is served over HTTP. The HTML also embeds the same number as a fallback and adds it to CSS and JavaScript URLs for cache busting. Update all four occurrences together when publishing a new release.

## Current structure

```text
index.html                  Browser application
styles.css                  Responsive visual design
app.js                      Upload, pose preview, playback, and export
pose-library/walk.json      Versioned canonical walk metadata
references/                 Research notes only; no copyrighted assets
```

## Product principles

- Preserve character identity, silhouette, palette, proportions, and style.
- Drive generations from structured pose templates rather than prompts alone.
- Align every frame to a common baseline and stable pivot.
- Keep frame-level review and regeneration central to the workflow.
- Hide image providers behind a stable generator interface.
- Keep uploaded images local until the user explicitly starts generation.

## Next milestone

Convert the static prototype to a typed application and implement one real `SpriteGenerator` provider behind an asynchronous job API. Generated frames should then replace the pose mock while retaining the existing preview, alignment, and export workflow.

## References

- [Spritesheets.ai](https://www.spritesheets.ai/)
- [AutoSprite](https://www.autosprite.io/)
- [AutoSprite documentation](https://www.autosprite.io/docs/how-to-use)
- [The Spriters Resource](https://www.spriters-resource.com/) — visual research only; do not redistribute or train on copyrighted assets without permission.
- [Eadweard Muybridge human animation studies](https://commons.wikimedia.org/wiki/Category:Eadward_Muybridge_animations_of_humans) — verify the licence on each individual file.
- Richard Williams, *The Animator's Survival Kit* — principles reference only; do not reproduce copyrighted text or diagrams.
- [Animation reference method](docs/ANIMATION_REFERENCE_METHOD.md)
