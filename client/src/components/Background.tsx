import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

export const Background = ({ children } : any) => {
  return (
    <LinearGradient
      // colors={['#fdea8c', '#edcdd0']}
      // colors={['#edcdd0','#ffffff']}
      // colors={['#b2a7cb','#ffffff']}
      colors={['#f3ebc4','#edcdd0']}
      style={{ flex: 1}}
    >
      {children}
    </LinearGradient>
  );
};