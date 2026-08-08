import React, { useLayoutEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useReducedMotionState } from "../useReducedMotion";

interface Props {
  routeKey: string;
  children: React.ReactNode;
}

/** Brief route entrance that respects the platform Reduce Motion preference. */
export default function ScreenTransition({ routeKey, children }: Props) {
  const { reducedMotion, known } = useReducedMotionState();
  const progress = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    progress.stopAnimation();
    if (!known || reducedMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 190,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [known, progress, reducedMotion, routeKey]);

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [6, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
