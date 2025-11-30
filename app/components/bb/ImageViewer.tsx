import { StyleSheet } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import * as theme from '@/constants/theme';

type Props = {
    imgSource: ImageSource;
    selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
    const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

    return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
    image: {
        width: 320,
        height: 440,
        borderRadius: theme.borders.borderRadiusLarge,
    },
});
