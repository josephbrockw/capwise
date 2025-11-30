import { View, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as theme from '@/constants/theme';

type Props = {
    onPress: () => void;
    icon: keyof typeof MaterialIcons.glyphMap;
};

export default function CircleButton({ onPress, icon }: Props) {
    return (
        <View style={styles.circleButtonContainer}>
            <Pressable style={styles.circleButton} onPress={onPress}>
                <MaterialIcons name={icon} size={38} color="#25292e" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    circleButtonContainer: {
        width: theme.buttons.circle.container.width,
        height: theme.buttons.circle.container.height,
        marginHorizontal: theme.buttons.circle.container.marginHorizontal,
        borderWidth: theme.buttons.circle.container.borderWidth,
        borderColor: theme.buttons.circle.container.borderColor,
        borderRadius: theme.buttons.circle.borderRadius,
        padding: theme.buttons.circle.container.padding,
    },
    circleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.buttons.circle.borderRadius,
        backgroundColor: theme.buttons.circle.background,
    }
});
