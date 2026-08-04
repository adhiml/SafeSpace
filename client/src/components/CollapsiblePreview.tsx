import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  View,
} from "react-native";

interface CollapsiblePreviewProps {
  children: (isExpanded: boolean) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CollapsiblePreview: React.FC<CollapsiblePreviewProps> = ({
  children,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setIsExpanded(!isExpanded)}
      style={style}
    >
      <View>
        {children(isExpanded)}
      </View>
    </TouchableOpacity>
  );
};
