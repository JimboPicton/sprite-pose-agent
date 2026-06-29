# Sprite Pose Agent

Current version: **v1.2.1**

A web-based foundation for turning one supplied character image into coherent animation frames and exportable sprite sheets.

The first prototype focuses on the core workflow: upload a character, choose an animation template, adjust its canonical skeletons over the reference, preview timing, and export a sprite sheet plus structured metadata. The initial library includes idle, walk, run, jump, crouch, crawl, hurt, death, and get-up sequences. Prop-heavy and multi-character WW1 motion will arrive later as richer optional pose packs.

## Run the prototype

No package installation or build step is required.

1. For pose planning only, open `index.html` directly in a modern browser.
2. For local ComfyUI generation on Windows, double-click `start-local.cmd`, then open `http://127.0.0.1:4173`. The command window stays open so startup errors remain visible. Alternatively run `node server.mjs`.
3. Upload a PNG, WEBP, or JPG character reference.
4. Build and preview the walk animation plan.
5. Select a frame and drag its pose joints over the character reference.
6. Use **Apply fit forward** to carry that frame's fitting offsets into all subsequent frames while preserving their motion.
7. Alternatively mark two or more edited poses as keyframes, then use **Create in-betweens** to interpolate editable frames between them.
8. Export the edited pose-study sheet or JSON metadata.

The current renderer establishes editable joint mapping, template schema, baseline, pivot, playback, export, and a local ComfyUI path. The Comfy workflow combines IP-Adapter Plus character conditioning with OpenPose ControlNet and starts from a fresh latent canvas.

The uploaded reference is automatically cropped around the character, squared, and placed on a neutral background before IP-Adapter sees it. Structured fields put essential costume and equipment traits before art direction and pose language. Identity modes alter both IP-Adapter timing and embedding behaviour; the fine-tune slider adjusts its weight.

The **Pose strength** control adjusts OpenPose ControlNet independently.

The optional **Pixel Snapper finish** quantizes each completed frame to a selected palette after generation. This is a deterministic finishing stage, rather than relying on a diffusion prompt alone to imitate pixel structure.

**Transparent Unity PNG** uses ComfyUI's native BiRefNet background-removal nodes to create a real alpha channel after generation. The control enables automatically when a compatible model is present in `ComfyUI-Shared/models/background_removal`. Prompting for a plain background is still useful, but is not treated as a substitute for segmentation.

The final stage scales every frame to an exact square Unity sprite size: 16, 32, 64, 128, or 256 pixels. Generation remains high resolution for anatomy and equipment construction. Pixel-finished frames use nearest-neighbour reduction; illustrated frames use Lanczos reduction. Detailed full-body characters are best developed at 128 or 256 pixels before testing smaller silhouettes.

Rendered images are retained against their frame for the current browser session, appear as timeline thumbnails, and replace pose guides in sprite-sheet export. **Render all missing frames** processes the remainder of the sequence one at a time.

## Sprite Sheet Lab

Open `sheet-lab.html` from the main source panel to process generated cyan-background sheets without involving ComfyUI. The lab provides:

- automatic corner sampling and adjustable chroma-key tolerance;
- configurable grid rows and columns;
- detection and removal of long ground lines;
- largest connected-subject isolation to discard small generator artefacts;
- warnings for frames touching cell edges or containing another large component;
- click-to-keep/reject frame triage;
- a live approved-frame animation player with row filtering and adjustable FPS;
- shared scale and bottom-baseline alignment;
- responsive source viewing that expands around the loaded sheet;
- optional global connected-figure detection that re-registers separated figures into evenly spaced cells;
- transfer of the approved preview row into Motion Study for skeletal overlay and further triage;
- transparent PNG export at 16, 32, 64, 128, or 256 pixels per cell.

Clean regular strips are the best inputs. Overlapping characters cannot be reconstructed automatically and should be rejected or regenerated.

## LoRA foundation

A project-specific LoRA is the planned route to a repeatable WW1 visual language and consistent cast.

1. Establish one target sprite resolution, palette range, outline treatment, camera angle, and proportion guide.
2. Build a rights-cleared training set for each reusable character or uniform family. Prefer 20–40 clean images covering the same identity from varied poses and angles.
3. Caption stable identity traits separately from changeable pose, view, and action traits.
4. Reserve a unique trigger token for each character or uniform family.
5. Keep a small validation set out of training and compare it on fixed seeds and canonical pose controls.
6. Train the style LoRA separately from character LoRAs where possible. This lets the app combine a shared WW1 game style with different soldiers.
7. Add the selected LoRA to the Comfy workflow between checkpoint loading and IP-Adapter/OpenPose conditioning.

Do not train on artwork unless its licence and provenance permit model training and derivative use.

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

Create and validate the first rights-cleared WW1 pixel-art style dataset, train a small SD 1.5 LoRA, and expose LoRA selection and strength in the existing local generator interface.

## References

- [Spritesheets.ai](https://www.spritesheets.ai/)
- [AutoSprite](https://www.autosprite.io/)
- [AutoSprite documentation](https://www.autosprite.io/docs/how-to-use)
- [The Spriters Resource](https://www.spriters-resource.com/) — visual research only; do not redistribute or train on copyrighted assets without permission.
- [Eadweard Muybridge human animation studies](https://commons.wikimedia.org/wiki/Category:Eadward_Muybridge_animations_of_humans) — verify the licence on each individual file.
- Richard Williams, *The Animator's Survival Kit* — principles reference only; do not reproduce copyrighted text or diagrams.
- [Animation reference method](docs/ANIMATION_REFERENCE_METHOD.md)
