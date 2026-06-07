// import React from "react";
// import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
// import { Dimensions } from "react-native";

// const { width, height } = Dimensions.get("window");

// export default function StaticBlurBackground() {
//   return (
//     <Canvas style={{ flex: 1 }}>
//       {/* Top Left */}
//       <Circle cx={80} cy={120} r={140} color="rgba(214,217,250,0.8)">
//         <BlurMask blur={80} style="solid" />
//       </Circle>

//       {/* Bottom Right */}
//       <Circle
//         cx={width - 80}
//         cy={height - 180}
//         r={180}
//         color="rgba(214,249,238,0.7)"
//       >
//         <BlurMask blur={100} style="solid" />
//       </Circle>

//       {/* Center */}
//       <Circle
//         cx={width / 2}
//         cy={height / 2}
//         r={160}
//         color="rgba(255,240,220,0.6)"
//       >
//         <BlurMask blur={90} style="solid" />
//       </Circle>
//     </Canvas>
//   );
// }