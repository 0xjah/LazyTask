declare module 'react-native-ios-kit' {
  import { Component } from 'react';
    import { ViewStyle } from 'react-native';

  export interface SwitchProps {
    value: boolean;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;
    trackColor?: string;
    thumbColor?: string;
  }

  export class Switch extends Component<SwitchProps> {}
}
