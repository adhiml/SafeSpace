import React from 'react';
import { Image, ImageProps } from 'react-native';
import { default_avatar } from '../types/index';

interface AvatarProps extends Partial<Omit<ImageProps, 'source'>> {
  size?: number;
}

/** Everyone shares the same default picture; custom photos are not supported. */
export const Avatar = ({ size = 35, style, ...props }: AvatarProps) => (
  <Image
    source={default_avatar}
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        resizeMode: 'cover',
      },
      style,
    ]}
    {...props}
  />
);
