#!/bin/sh
#
# Xcode Cloud runs this immediately after cloning, before it resolves the
# workspace. The generated project is not tracked (see .gitignore): it is built
# from app.json plus the native sources under native/ios/ by `expo prebuild`,
# so CI has to generate it here or the build fails with "Workspace
# SkullLedger.xcworkspace does not exist".
#
# Prebuild derives SkullLedger from the new product name. The existing Cloud
# workflow still stores SkullKingCrewLedger, so publish compatibility aliases
# after generation. These build identifiers are not user-facing app branding.
#
# The script has to live next to the Xcode project, which is why it sits under
# ios/ while everything else there is generated and ignored. Xcode Cloud starts
# it with ci_scripts as the working directory.
set -e

cd "${CI_PRIMARY_REPOSITORY_PATH:-$CI_WORKSPACE}"

# Xcode Cloud images ship Homebrew but no Node.
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

npm ci

# app.json carries a static buildNumber, so every archive would reuse it and
# App Store Connect rejects a build number it has already seen. CI_BUILD_NUMBER
# is unique per Xcode Cloud build, so stamp it in before prebuild bakes the
# value into Info.plist.
if [ -n "$CI_BUILD_NUMBER" ]; then
  node -e '
    const fs = require("fs");
    const config = JSON.parse(fs.readFileSync("app.json", "utf8"));
    config.expo.ios.buildNumber = String(process.env.CI_BUILD_NUMBER);
    fs.writeFileSync("app.json", JSON.stringify(config, null, 2) + "\n");
  '
fi

# An ios/ directory that holds nothing but ci_scripts is not a project prebuild
# recognises, so it clears the directory and reinitialises it — taking these
# scripts with it, even without --clean. Keep them aside and put them back for
# the later build phases.
scripts_backup=$(mktemp -d)
cp -Rp ios/ci_scripts "$scripts_backup/"

# Generates ios/SkullLedger.xcworkspace, the shared scheme and the
# Pods.
npx expo prebuild --platform ios

cp -Rp "$scripts_backup/ci_scripts" ios/
rm -rf "$scripts_backup"

# Verify the new workspace before creating the legacy Cloud aliases. Fail
# here, where the cause is visible, rather than during workspace resolution.
if [ ! -d ios/SkullLedger.xcworkspace ]; then
  echo "prebuild did not generate ios/SkullLedger.xcworkspace." >&2
  echo "Check that expo.name in app.json is still \"Skull Ledger\"." >&2
  exit 1
fi

# Keep the already-configured Cloud workspace and scheme usable. The copied
# scheme still references the SkullLedger target and product; only its lookup
# name differs. Both workspace paths live under ios/, so relative references
# in contents.xcworkspacedata continue to resolve to the new project and Pods.
ln -sfn SkullLedger.xcworkspace ios/SkullKingCrewLedger.xcworkspace
cp ios/SkullLedger.xcodeproj/xcshareddata/xcschemes/SkullLedger.xcscheme \
  ios/SkullLedger.xcodeproj/xcshareddata/xcschemes/SkullKingCrewLedger.xcscheme
