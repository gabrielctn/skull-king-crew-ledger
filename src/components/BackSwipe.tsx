import React from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import {
  backSwipeCommits,
  backSwipeTravel,
  isBackSwipe,
} from "../backSwipePolicy";
import { useI18n } from "../i18n/context";
import { useReducedMotionState } from "../useReducedMotion";

interface Props {
  /** False on the screen that has nowhere to go back to. */
  enabled: boolean;
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * The edge swipe every iOS app answers to, for screens that also carry a back
 * button. There is no navigation stack behind the current screen here, so the
 * screen slides off over the app background rather than uncovering the one it
 * came from.
 *
 * Browsers run this gesture themselves, and running it twice would go back
 * twice, so the web is left to them. The back button is what every platform
 * shares; this is the native platform's extra way of reaching it.
 */
export default function BackSwipe({ enabled, onBack, children }: Props) {
  const { width } = useWindowDimensions();
  const { lang } = useI18n();
  const { reducedMotion } = useReducedMotionState();
  const translate = React.useRef(new Animated.Value(0)).current;

  // The responder is built once, so everything it reads lives behind a ref.
  const latest = React.useRef({
    enabled: false,
    onBack,
    reducedMotion,
    rtl: false,
    width,
  });
  latest.current = {
    enabled: enabled && Platform.OS !== "web",
    onBack,
    reducedMotion,
    rtl: lang === "ar",
    width,
  };

  const settle = React.useCallback(
    (toValue: number, then?: () => void) => {
      Animated.spring(translate, {
        toValue,
        bounciness: 0,
        useNativeDriver: Platform.OS !== "web",
      }).start(then);
    },
    [translate]
  );

  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => {
          const { enabled: on, rtl, width: screenWidth } = latest.current;
          return (
            on &&
            isBackSwipe({
              x0: gesture.x0,
              dx: gesture.dx,
              dy: gesture.dy,
              width: screenWidth,
              rtl,
            })
          );
        },
        onPanResponderMove: (_event, gesture) => {
          const { rtl, width: screenWidth } = latest.current;
          translate.setValue(
            backSwipeTravel({ dx: gesture.dx, width: screenWidth, rtl })
          );
        },
        onPanResponderRelease: (_event, gesture) => {
          const {
            onBack: goBack,
            reducedMotion: reduced,
            rtl,
            width: screenWidth,
          } = latest.current;
          const commits = backSwipeCommits({
            dx: gesture.dx,
            vx: gesture.vx,
            width: screenWidth,
            rtl,
          });

          if (!commits) {
            settle(0);
            return;
          }
          if (reduced) {
            translate.setValue(0);
            goBack();
            return;
          }
          Animated.timing(translate, {
            toValue: rtl ? -screenWidth : screenWidth,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: Platform.OS !== "web",
          }).start(() => {
            translate.setValue(0);
            goBack();
          });
        },
        onPanResponderTerminate: () => settle(0),
      }),
    [settle, translate]
  );

  return (
    <Animated.View
      style={[styles.root, { transform: [{ translateX: translate }] }]}
      {...responder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
