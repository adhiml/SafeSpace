import type {ImageSourcePropType} from 'react-native';

declare global {
    interface ImageRequireSource {
        focused: boolean;
        source: ImageSourcePropType;
    }
}