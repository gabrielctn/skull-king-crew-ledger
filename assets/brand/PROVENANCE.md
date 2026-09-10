# Skull Ledger artwork

Created with OpenAI image generation on 10 September 2026 for this app. No publisher artwork was supplied as a reference.

- `../illustrations/ledger.png`: original teal/brass score ledger, ivory tally mark, coral bookmark and cream quill on transparency. Requested a painterly engraved editorial illustration, strong small-size silhouette, and no skulls, crowns, swords, characters, mermaids, official game logos, card artwork, lettering or watermarks.
- `ledger-icon-source.png`: generated from the ledger above, preserving the object on an opaque midnight-teal background with icon-safe margins. No baked-in rounded corners or text.
- `../illustrations/trophy.png`: original brass cup with teal base, coral ribbon and three gold counters on transparency. Requested the same materials and no skulls, crowns, swords, characters, mermaids, pirate flags, card artwork, text or logos.
- The compass and leather-map textures are pre-existing project illustrations retained as generic nautical decoration. Their presence is not a claim of legal clearance.

`scripts/build-brand-assets.py` packages the ledger and icon into Expo/PWA sizes using ffmpeg; it does not recreate or depend on the retired crowned-skull artwork. The retired skull, mermaid, parrot and treasure chest PNGs are removed from the runtime asset directory.
