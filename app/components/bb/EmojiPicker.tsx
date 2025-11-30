import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { PropsWithChildren } from 'react';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as theme from '@/constants/theme';

type Props = PropsWithChildren<{
    isVisible: boolean,
    onClose: () => void,
}>;

export default function EmojiPicker({ isVisible, onClose, children }: Props) {
    return (
        <View>
            <Modal animationType="slide" visible={isVisible} transparent={true} >
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Pick a sticker</Text>
                        <Pressable onPress={onClose}>
                            <MaterialIcons name="close" size={22} color="#fff" />
                        </Pressable>
                    </View>
                    {children}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  modalContent: {
    height: '25%',
    width: '100%',
    backgroundColor: theme.colors.background,
    borderTopRightRadius: theme.borders.borderRadiusLarge,
    borderTopLeftRadius: theme.borders.borderRadiusLarge,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '16%',
    backgroundColor: theme.colors.darkGray,
    borderTopRightRadius: theme.borders.borderRadiusMedium,
    borderTopLeftRadius: theme.borders.borderRadiusMedium,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
  },
});
