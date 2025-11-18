// Builtin modules
import { View, StyleSheet } from 'react-native'

// Custom modules
import CardEMaray from '../../Components/ReportScreen/CardEmaray'
import CardAISummary from '../../Components/ReportScreen/CardAISummary'
import CardVoiceEmarary from '../../Components/ReportScreen/CardVoiceEmaray'
import CardCheckerList from '../../Components/ReportScreen/CardChequerList'

const ShowAIFunctions = () => {
  // Hay que mostrar una pantalla con las opciones "plus", en forma de nuevas "Card"
  // AISummary
  // Chat -> eMaray
  // Alguna extra... tipo gráficos puede ser...

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={styles.row}>
          <CardEMaray />
          <CardAISummary />
        </View>
        <View style={styles.row}>
          <CardVoiceEmarary />
          <CardCheckerList />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 40 // Espacio entre las filas
  },
  button: {
    // backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10, // Espacio entre los botones
    borderRadius: 10
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  }
})

export default ShowAIFunctions
