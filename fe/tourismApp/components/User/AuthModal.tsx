import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AuthForm from './AuthForm';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function AuthModal({ visible, onClose, onSwitchToSignUp }: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <AuthForm onSwitchToSignUp={onSwitchToSignUp} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 28,
    color: '#333',
  },
});
