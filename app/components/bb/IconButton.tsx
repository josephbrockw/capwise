import { Pressable, StyleSheet, Text } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as theme from '@/constants/theme';

type Props = {
    onPress: () => void;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
};

export default function IconButton({ onPress, label, icon }: Props) {
    return (
        <Pressable style={styles.iconButton} onPress={onPress}>
            <MaterialIcons name={icon} size={24} color="#fff" />
            <Text style={styles.iconButtonLabel}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonLabel: {
        color: theme.buttons.icon.color,
        marginTop: theme.buttons.icon.marginTop,
    },
});
