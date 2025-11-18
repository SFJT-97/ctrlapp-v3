import * as React from 'react'
import { Modal, Portal, Text } from 'react-native-paper'

const SettingsModal = () => {
  const [visible, setVisible] = React.useState(false)

  const showModal = () => setVisible(true)
  const hideModal = () => setVisible(false)
  const containerStyle = { backgroundColor: 'white', padding: 20 }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        <Text>Example Modal.  Click outside this area to dismiss.</Text>
        <Text>Test test</Text>
      </Modal>
    </Portal>
  )
}

export default SettingsModal
