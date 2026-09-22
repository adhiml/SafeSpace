export const colors = {

  primary: '#4B2E2A',        
  primaryLight: '#E8D5C4',

  secondary: '#8B5E3C',      
  secondaryLight: '#F1E6DA', 

  background: 'transparent',     // warm cream (latte foam base)
  surface: '#FFFFFF',        // clean foam white

  // Text (mocha tones)
  text: '#2F1F1D',           // deep mocha (softer than black)
  textMuted: '#7A6A63',      // latte brown

  border: '#FAF6F1',        // soft coffee foam border

  // Mood colors (coffee-inspired emotional tones)
  stressed: '#F1BABF',      // burnt caramel blush
  anxious: '#E8C07D',       // cappuccino beige
  okay: '#BFD7EA',         // neutral latte grey-brown
  calm: '#C3D8C1',         // soft matcha latte green
  happy: '#F9E3E9',        // vanilla cream

  // Depth
  shadow: 'rgba(47, 31, 29, 0.12)',
};

export const palette = {
  // Accent = brand mocha
  accent: colors.primary, // #4B2E2A
  accentDark: "#3A231F",
  accentSoft: colors.primaryLight, // #E8D5C4
  accentWash: colors.secondaryLight, // #F1E6DA
  action: colors.secondary, // #8B5E3C — FAB / primary action

  // Status tones, derived from the mood colours
  okBg: colors.calm, // #C3D8C1
  okText: "#3F5A3C",
  okDot: "#7FA97B",
  warnBg: colors.anxious, // #E8C07D
  warnText: "#7A5A1E",
  warnDot: "#C9903C",
  pastBg: colors.secondaryLight,
  pastDot: "#D8CCC4",
  activeBg: "#D1FAE5",
  activeText: "#065F46",
  activeDot: "#10B981",
  cancelledBg: "#FEE2E2",
  cancelledText: "#991B1B",
  cancelledDot: "#EF4444",

  // Neutrals
  surface: colors.surface,
  surfaceAlt: "#FBF7F3",
  border: "#EDE3DA",
  borderSoft: colors.border, // #FAF6F1
  text: colors.text, // #2F1F1D
  textSoft: "#5A4A44",
  textMuted: colors.textMuted, // #7A6A63
  textFaint: "#A99A92",
  white: "#FFFFFF",
  shadow: colors.shadow,
  overlay: "rgba(47, 31, 29, 0.45)", // modal backdrop
  dangerSoft: "#f4dfdf", // delete/cancel icon background
  shadowStrong: "#000", // dropdown/menu shadow
  whiteMuted: "rgba(255,255,255,0.85)", // subtitle text on filled/active surfaces
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};
