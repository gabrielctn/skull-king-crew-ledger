# Skull Ledger — App Store revision, 10 September 2026

Selected by Gabriel: Skull Ledger. No exact app-name match found in Apple Search API results for the US and France. Exact-phrase web and indexed Google Play searches did not reveal an app of this name. An unrelated Dice of Kalma fan site uses “SKULL LEDGER” as a heading (https://diceofkalmaskulls.com/). This is a limited availability check, not trademark clearance or a guarantee of review approval.

## Identity

- App name: Skull Ledger in both App Store listing languages and all six in-app locales.
- English subtitle: Shared scores and statistics.
- French subtitle: Scores et tables partagées.
- App icon and home emblem: original teal score ledger, brass fittings, tally mark and quill.
- Crowned skull, mermaid, parrot and skull-decorated chest illustrations removed from runtime assets. Ledger, compass and trophy are the remaining decorative subjects.
- Factual game and card names remain in scoring controls/rules. The store description identifies compatibility once near the end and explicitly disclaims affiliation. This is a deliberate compromise to explain what the app supports; Apple may still request removal or authorization.
- Bundle ID, URL scheme, Expo project ID/slug, deployed PWA path, backup format and stored-data keys remain stable for compatibility.

## Before resubmission

1. Publish the reviewed repository changes so the support/privacy pages and PWA carry the new identity.
2. Build the new code with the existing Xcode Cloud workflow. The generated project is `SkullLedger`; the post-clone script supplies the legacy workspace/scheme aliases expected by the current workflow. No workflow settings migration is needed.
3. Upload/select a new iOS build. Local configuration is 1.13.2 (29); Xcode Cloud continues to assign its own unique CI build number. Submitted build 26 still contains the old icon and branding.
4. Replace old English/French iPhone and iPad screenshot sets with captures of the new native build. Do not retain old marketing screenshots or the older preview video with the crowned skull.
5. Add review notes describing the actual changes and verify all saved metadata, then resubmit. No message to App Review is needed merely to prepare this revision.

The checked-in descriptions remove the obsolete offline-snapshot sharing claim and describe the present scorekeeping features. App Store review approval remains Apple's decision.

## Manual App Store Connect checklist

Computer-use was stopped at Gabriel's request after the metadata edits. The English and French name and description fields were saved; verify the values below before submission. No screenshots were uploaded and no review submission or Cloud workflow edits were made. Repository publication is handled separately from this manual submission checklist.

1. **Informations sur l'app**: select English (US), then French. Name should be **Skull Ledger** in both. Keep the existing subtitles (“Shared scores and statistics” / “Scores et tables partagées”). Save if needed.
2. **iOS 1.13.2**: verify the English/French descriptions against `description.en-US.txt` and `description.fr-FR.txt`. Promotional text and existing generic keywords can stay. The obsolete offline-snapshot promise must be absent.
3. Publish the repository change on main when ready. The existing Cloud workflow builds and uploads on a main change; it also distributes to the configured external TestFlight group. Review the change before pushing. The web deployment updates the support/privacy pages at their existing URLs.
4. After the new Cloud build completes and processes, choose that build under **Build**, replacing **26**. Use the new build number shown in Cloud, not an assumed number. The new icon arrives through the binary; it is not a separately editable iOS store icon.
5. Capture the revised native app on iPhone and iPad in English and French. A focused set showing an active game, results, statistics and the new home screen is sufficient; all screenshots must reflect actual app behavior. The existing capture contracts document supported 6.9-inch iPhone and 13-inch iPad dimensions. Replacing only image captions is insufficient if the old app branding is visible inside the screenshot.
6. In **Afficher toutes les tailles dans le gestionnaire des visuels**, replace the old screenshot sets for both languages and both device families. Check whether other device sizes inherit the new sets or contain separate old uploads. Do not retain the old crowned-skull screenshots. No App Preview video was present in the inspected iPhone listing; replace or remove any old video if another device/localization contains one.
7. Open the live support/privacy URLs after deployment and verify the new name/icon. Keep these URLs and the bundle identifier unchanged.
8. Paste `review-notes.txt` into **Informations utiles à la vérification de l'app → Remarques** only after the new build and screenshots are selected; its statements describe that completed state.
9. Save, use **Mettre à jour la vérification** / **Add for Review** as shown, and resubmit from the unresolved submission. The existing automatic-release setting was left unchanged: an approved version can publish automatically.

The exact wording and controls may vary with submission state. Do not submit while build 26 or old screenshots remain selected.
