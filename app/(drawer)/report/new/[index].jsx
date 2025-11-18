import React, { useState, useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import { useTheme, Switch, Text } from 'react-native-paper'
import { Stack, useLocalSearchParams } from 'expo-router'

import HelpButton from '../../../../globals/components/HelpButton'
import ReportEvent from '../Components/newEvents/ReportEvent'
import ReportUrgentEvent from '../Components/newEvents/ReportUrgentEvent'
import LockOrientation from '../../../../globals/LockOrientation'

const AlertSwitch = ({ isSwitchOn, onToggleSwitch }) => {
  const theme = useTheme()

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall' style={{ color: isSwitchOn ? theme.colors.error : theme.colors.onBackground }}>
        Urgency
      </Text>
      <Switch
        value={isSwitchOn}
        onValueChange={onToggleSwitch}
        color={isSwitchOn ? theme.colors.error : undefined}
      />

      {isSwitchOn
        ? (
          <Text style={{ color: theme.colors.error }}>
            Alert: Toggling the switch will notify all app users within the company
          </Text>
          )
        : (
          <Text>
            This report will be submitted notifying the pertinent app users within the company
          </Text>
          )}
    </View>
  )
}

export default function NewReport () {
  const [isSwitchOn, setIsSwitchOn] = useState(false)
  const [eventNumber, setEventNumber] = useState(null)
  // const theme = useTheme()

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn)
  const params = useLocalSearchParams()
  const ticketsAcount = params?.ticketsAcount
  const name = params?.name
  let defaultValues = params?.defaultValues

  useEffect(() => {
    defaultValues = JSON.parse(defaultValues)
    setEventNumber(ticketsAcount)
  }, [])

  useEffect(() => setEventNumber(ticketsAcount), [ticketsAcount])

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: (`New Event #${eventNumber}`),
          headerRight: () => <HelpButton />
        }}
      />
      <View style={{ rowGap: 30, marginHorizontal: 15, marginTop: 25, marginBottom: 60 }}>
        <AlertSwitch isSwitchOn={isSwitchOn} onToggleSwitch={onToggleSwitch} />
        <LockOrientation />
        {isSwitchOn
          ? (
            <ReportUrgentEvent ticketsAcount={ticketsAcount} name={name} defaultValues={defaultValues} />
            )
          : (
            <ReportEvent ticketsAcount={ticketsAcount} name={name} defaultValues={defaultValues} />
            )}

      </View>

    </ScrollView>

  )
}
