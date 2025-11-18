// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, SegmentedButtons } from 'react-native-paper'

const UrgentRiskQualification = ({ allTicketNewClassification, setEventClassification, eventClassificationData, fromAIReport }) => {
  const [value, setValue] = useState('')
  const [load, setLoad] = useState(false)

  let eventClassification = allTicketNewClassification?.filter(el => el?.idClassification === 'ARI' || el?.idClassification === 'PEI')

  eventClassification = eventClassification?.map(el => {
    return (
      {
        key: el?.idClassification,
        value: el?.idClassification + ' - ' + el?.classification
      }
    )
  })
  useEffect(() => {
    if (fromAIReport && eventClassificationData && eventClassificationData !== '-') {
      setEventClassification(eventClassificationData)
      setValue(eventClassificationData)
      setLoad(true)
    }
  }, [eventClassificationData])
  if (load || !eventClassification) {
    return <></>
  } else {
    return (
      <View style={{ rowGap: 10 }}>
        <Text variant='headlineSmall'>Classification</Text>
        <SegmentedButtons
          value={value}
          onValueChange={(val) => {
            setValue(val)
            setEventClassification(val)
          }}
          buttons={[
            {
              value: eventClassification[0]?.value,
              label: eventClassification[0]?.value
            },
            {
              value: eventClassification[1]?.value,
              label: eventClassification[1]?.value
            }
          ]}
        />
      </View>
    )
  }
}

export default UrgentRiskQualification
