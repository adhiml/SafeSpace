import React, { useState } from "react";
import { Image, ImageProps } from "react-native";
import { default_avatar } from '../types/index';

interface AvatarProps extends Partial<ImageProps> {
  uri?: string;
  size?: number;
}

export const Avatar = ({ uri, size = 35, style, ...props }: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  const source = uri && uri.trim() !== "" && !hasError 
    ? { uri } 
    : default_avatar;

  return (
    <Image
      source={source}
      onError={() => setHasError(true)}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          resizeMode: "cover",
        },
        style,
      ]}
      {...props}
    />
  );
};