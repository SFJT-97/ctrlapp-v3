// Builtin modules
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-paper'
import { Link } from 'expo-router'

// Custom modules

//  'http://164.92.67.239:5000/' // digital ocean de controlaccion

const AIFunctions = () => {
  return (
    <View>
      <View style={styles.buttonContainer}>
        <Link
          href={{
            pathname: 'report/plusFunctions/aiFunctions/[index]'
          }}
          asChild
        >
          <TouchableOpacity style={styles.button}>
            <View style={styles.button}>
              <Icon source='archive-plus' size={50} color='#FFFFFF' style={{ paddingBottom: 5 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, paddingTop: 5 }}>Plus Functions</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default AIFunctions

const styles = StyleSheet.create({
  buttonContainer: {
    width: 175,
    height: 175,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3
  },
  button: {
    borderRadius: 25,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#006A6A'
  }
})
