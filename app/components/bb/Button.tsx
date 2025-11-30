import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as theme from '@/constants/theme';

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
}

export default function Button({ label, theme, onPress }: Props) {
    if (theme === 'primary') {
        return (
            <View
                style={[
                    styles.buttonContainer,
                    { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18 },
                ]}>
                <Pressable style={[styles.button, {backgroundColor: '#fff'}]} onPress={onPress}>
                    <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onPress}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: theme.buttons.primary.container.width,
        height: theme.buttons.primary.container.height,
        marginHorizontal: theme.buttons.primary.container.marginHorizontal,
        alignItems: theme.buttons.primary.container.alignItems,
        justifyContent: theme.buttons.primary.container.justifyContent,
        padding: theme.buttons.primary.container.padding,
    },
    button: {
        borderRadius: theme.buttons.primary.button.borderRadius,
        width: theme.buttons.primary.button.width,
        height: theme.buttons.primary.button.height,
        alignItems: theme.buttons.primary.button.alignItems,
        justifyContent: theme.buttons.primary.button.justifyContent,
        flexDirection: theme.buttons.primary.button.flexDirection,
    },
    buttonIcon: {
        paddingRight: theme.buttons.primary.icon.paddingRight,
    },
    buttonLabel: {
        color: theme.buttons.primary.color,
        fontSize: theme.buttons.primary.fontSize,
    },
});
