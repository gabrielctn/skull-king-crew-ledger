import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";

interface Props {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  size: number;
  color: string;
  accessibilityHidden?: boolean;
}

/** Icon-only decoration; labelled controls retain ownership of accessibility. */
export default function AppIcon({
  name,
  size,
  color,
  accessibilityHidden = true,
}: Props) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={!accessibilityHidden}
      importantForAccessibility={accessibilityHidden ? "no-hide-descendants" : "auto"}
      aria-hidden={accessibilityHidden}
    />
  );
}
