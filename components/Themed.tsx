/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';
import { getFontFamily } from '@/utils/fontHelper';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const { currentTheme } = useAppTheme();
  const colorFromProps = props.light || props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return (currentTheme as any)[colorName] || currentTheme.text;
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, children, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Get text content for font detection
  const textContent = typeof children === 'string' ? children : '';
  const fontFamily = getFontFamily(textContent);

  return <DefaultText style={[{ color, fontFamily }, style]} {...otherProps}>{children}</DefaultText>;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

