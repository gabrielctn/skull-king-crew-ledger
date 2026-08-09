import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { cloudBackupManager } from "../cloudSync";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";
import GlassSurface from "./GlassSurface";
import AppIcon from "./AppIcon";

interface Props {
  /** Join code consumed from a scanned link; null hides the modal. */
  code: string | null;
  onClose: () => void;
  /** Adopt + merge (the App-level link flow); resolves when done. */
  onJoin: (code: string) => Promise<number | null>;
}

type Phase =
  | { kind: "loading" }
  | { kind: "preview"; tableName: string | null; gameCount: number }
  | { kind: "joining"; tableName: string | null }
  | { kind: "joined"; tableName: string | null }
  | { kind: "error" };

/**
 * Confirmation sheet for a scanned table invite. Joining another table
 * replaces this device's cloud identity (after merging), so it must never
 * happen silently: the table is previewed first, then explicitly confirmed.
 */
export default function JoinTableModal({ code, onClose, onJoin }: Props) {
  const { t } = useI18n();
  const [phase, setPhase] = React.useState<Phase>({ kind: "loading" });

  React.useEffect(() => {
    if (!code) return;
    let active = true;
    setPhase({ kind: "loading" });
    cloudBackupManager()
      .peek(code)
      .then((data) => {
        if (!active) return;
        setPhase({
          kind: "preview",
          tableName: data?.tableName ?? null,
          gameCount: data?.history.length ?? 0,
        });
      })
      .catch(() => {
        if (active) setPhase({ kind: "error" });
      });
    return () => {
      active = false;
    };
  }, [code]);

  const join = async () => {
    if (!code || phase.kind !== "preview") return;
    const tableName = phase.tableName;
    setPhase({ kind: "joining", tableName });
    try {
      await onJoin(code);
      setPhase({ kind: "joined", tableName });
    } catch {
      setPhase({ kind: "error" });
    }
  };

  const dismiss = () => {
    if (phase.kind !== "joining") onClose();
  };
  const joining = phase.kind === "joining";

  const title =
    phase.kind === "preview" ||
    phase.kind === "joining" ||
    phase.kind === "joined"
      ? phase.tableName
        ? t.joinTable.named(phase.tableName)
        : t.joinTable.unnamed
      : t.joinTable.title;

  return (
    <Modal
      visible={code !== null}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
    >
      <View style={styles.overlay}>
        <GlassSurface
          intensity={56}
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <View style={styles.titleRow}>
            <AppIcon name="anchor" size={22} color={colors.gold} />
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          </View>

          {phase.kind === "loading" ? (
            <ActivityIndicator
              color={colors.gold}
              style={styles.spinner}
              accessibilityLabel={t.joinTable.busy}
            />
          ) : null}

          {phase.kind === "preview" ? (
            <Text style={styles.message}>
              {t.joinTable.message(phase.gameCount)}
            </Text>
          ) : null}

          {phase.kind === "joining" ? (
            <Text style={styles.message}>{t.joinTable.busy}</Text>
          ) : null}

          {phase.kind === "joined" ? (
            <Text style={[styles.message, styles.success]}>
              {t.joinTable.success}
            </Text>
          ) : null}

          {phase.kind === "error" ? (
            <Text style={[styles.message, styles.error]}>
              {t.joinTable.error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {phase.kind === "preview" || joining ? (
              <>
                <TouchableOpacity
                  style={[styles.confirm, joining && styles.confirmBusy]}
                  onPress={() => void join()}
                  disabled={joining}
                  accessibilityRole="button"
                  accessibilityState={{ busy: joining, disabled: joining }}
                  aria-busy={joining}
                >
                  <View style={styles.confirmContents}>
                    <Text style={styles.confirmText}>{t.joinTable.confirm}</Text>
                    {joining ? (
                      <ActivityIndicator
                        color={colors.bg}
                        accessible={false}
                        aria-hidden
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
                {!joining ? (
                  <TouchableOpacity
                    style={styles.cancel}
                    onPress={dismiss}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelText}>{t.joinTable.cancel}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
            {phase.kind === "joined" || phase.kind === "error" ? (
              <TouchableOpacity
                style={styles.confirm}
                onPress={onClose}
                accessibilityRole="button"
              >
                <Text style={styles.confirmText}>{t.common.dismiss}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { color: colors.text, fontSize: 20, fontWeight: "800", marginStart: spacing.xs },
  message: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  success: { color: colors.positive },
  error: { color: colors.negative },
  spinner: { marginTop: spacing.md, alignSelf: "center" },
  actions: { marginTop: spacing.lg },
  confirm: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  confirmBusy: { opacity: 0.78 },
  confirmContents: { flexDirection: "row", alignItems: "center", columnGap: spacing.sm },
  confirmText: { color: colors.bg, fontSize: 14, fontWeight: "800" },
  cancel: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
