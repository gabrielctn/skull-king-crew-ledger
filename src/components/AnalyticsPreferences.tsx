import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AnalyticsConsent,
  applyAnalyticsConsent,
  clearAnalyticsConsent,
  loadAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "../analytics";
import { useI18n } from "../i18n/context";
import { colors, radius, spacing } from "../theme";
import ToggleSwitch from "./ToggleSwitch";

/** Web-only controls for changing or reopening the analytics choice. */
export default function AnalyticsPreferences() {
  const { t } = useI18n();
  const [consent, setConsent] = React.useState<AnalyticsConsent | null>(() =>
    loadAnalyticsConsent()
  );

  React.useEffect(() => subscribeAnalyticsConsent(setConsent), []);

  if (Platform.OS !== "web") return null;

  const accepted = consent === "accepted";
  const status =
    consent === null
      ? null
      : accepted
        ? t.settings.privacy.accepted
        : t.settings.privacy.declined;

  return (
    <>
      <Text style={[styles.section, styles.sectionSpacing]}>
        {t.settings.privacy.title}
      </Text>
      <Text style={styles.hint}>{t.settings.privacy.hint}</Text>
      <View style={styles.card}>
        <View style={styles.copy}>
          <Text style={styles.title}>{t.settings.privacy.analyticsTitle}</Text>
          <Text style={styles.hint}>{t.settings.privacy.analyticsHint}</Text>
          {status ? (
            <Text style={styles.status} accessibilityRole="summary">
              {status}
            </Text>
          ) : null}
        </View>
        <ToggleSwitch
          value={accepted}
          onValueChange={(next) =>
            applyAnalyticsConsent(next ? "accepted" : "declined")
          }
          accessibilityLabel={t.settings.privacy.analyticsTitle}
        />
      </View>
      <Pressable
        style={styles.reset}
        onPress={clearAnalyticsConsent}
        accessibilityRole="button"
      >
        <Text style={styles.resetText}>{t.settings.privacy.reset}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionSpacing: { marginTop: spacing.xl },
  hint: { color: colors.textDim, fontSize: 12, lineHeight: 17 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  copy: { flex: 1, marginEnd: spacing.md },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  status: { color: colors.gold, fontSize: 12, fontWeight: "700", marginTop: spacing.xs },
  reset: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginTop: spacing.xs },
  resetText: { color: colors.accent, fontSize: 13, fontWeight: "800" },
});
