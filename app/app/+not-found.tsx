import { View, Text, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";
import * as theme from '@/constants/theme';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops! Not Found' }} />
            <View style={styles.container}>
                <Text style={styles.text}>404</Text>
                <Link href="/" style={styles.button}>
                    Go to Home
                </Link>
            </View>
        </>
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
    button: {
        backgroundColor: theme.buttons.primary.background,
        color: theme.buttons.primary.color,
        padding: theme.buttons.padding,
        borderRadius: theme.buttons.borderRadius,
        marginTop: 20,
    },
});
