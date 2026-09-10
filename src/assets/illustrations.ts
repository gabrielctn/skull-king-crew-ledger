import { ImageSourcePropType } from "react-native";

export const illustrations = {
  ledger: require("../../assets/illustrations/ledger.png") as ImageSourcePropType,
  compass: require("../../assets/illustrations/compass.png") as ImageSourcePropType,
  trophy: require("../../assets/illustrations/trophy.png") as ImageSourcePropType,
  brandTexture: require("../../assets/brand/leather-map-texture-ui.jpg") as ImageSourcePropType,
} as const;
