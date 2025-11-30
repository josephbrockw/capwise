import { Text, View, StyleSheet } from 'react-native';
import * as theme from '@/constants/theme';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>About Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: theme.colors.text,
    },
});
