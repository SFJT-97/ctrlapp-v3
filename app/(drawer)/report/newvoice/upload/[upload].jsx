// Builtin modules
import { useState, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import HelpButton from '../../../../../globals/components/HelpButton'
import ReportEventIA from '../../Components/newEvents/ReportEventIA'
import ReportUrgentEventIA from '../../Components/newEvents/ReportUrgentEventIA'
import LockOrientation from '../../../../../globals/LockOrientation'
// import { useTheme } from 'react-native-paper'

export default function NewReportAI () {
  // const theme = useTheme()

  const [urgentReport, setUrgenReport] = useState(false)
  const params = useLocalSearchParams()
  const ticketsAcount = params?.ticketsAcount
  const name = params?.name
  const strDefaultValues = params?.strDefaultValues
  const responseJSON = params?.responseJSON
  const parDefaultValues = JSON.parse(strDefaultValues)
  const parResponseJSON = JSON.parse(responseJSON)

  useEffect(() => {
    if (responseJSON) {
      if (responseJSON?.eventClassification === 'ARI - High Risk' || responseJSON?.eventClassification === 'PEI - INMINENT RISK') {
        setUrgenReport(true)
      } else {
        setUrgenReport(false)
      }
    }
  }, [responseJSON])

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: ('Voice Event Summary'),
          headerBackTitle: ('Back'),
          headerRight: () => <HelpButton />
        }}
      />
      <View style={{ rowGap: 30, marginHorizontal: 15, marginTop: 25, marginBottom: 60 }}>
        <LockOrientation />
        {urgentReport
          ? (
            <ReportUrgentEventIA ticketsAcount={ticketsAcount} name={name} defaultValues={parDefaultValues} responseJSON={parResponseJSON} />
            )
          : (
            <ReportEventIA ticketsAcount={ticketsAcount} name={name} defaultValues={parDefaultValues} responseJSON={parResponseJSON} />
            )}
      </View>
    </ScrollView>
  )
}
