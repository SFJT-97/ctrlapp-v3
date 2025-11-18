// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

const RiskQualification = ({ allRiskQualifications, setRiskQualification, riskQualificationValue, fromAIReport }) => {
  const theme = useTheme()

  const [value, setValue] = useState('')

  const [riskType, setRiskType] = useState({ key: 0, value: '' })

  useEffect(() => {
    if (allRiskQualifications) {
      const temp = allRiskQualifications.map(el => {
        return (
          {
            key: el.riskQualificationLevel,
            value: el.riskQualificationDescription
          }
        )
      })
      setRiskType(temp)
    }
  }, [allRiskQualifications])

  useEffect(() => {
    if (!fromAIReport) setValue(value)
  }, [])

  useEffect(() => {
    if (fromAIReport && riskQualificationValue && riskQualificationValue !== '-') {
      setRiskQualification(riskQualificationValue)
      setValue(riskQualificationValue)
    }
  }, [riskQualificationValue])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall'>Risk</Text>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          setRiskQualification(val)
        }}
        placeholder={fromAIReport && riskQualificationValue !== '-' ? riskQualificationValue : 'Select Option'}
        data={riskType}
        dropdownTextStyles={{ color: theme.colors.onBackground }}
        inputStyles={{ color: theme.colors.onBackground }} // texto adentro de la caja
        disabledItemStyles={{ backgroundColor: theme.colors.background }}
        disabledTextStyles={{ color: theme.colors.onSurfaceDisabled }}
        boxStyles={{ backgroundColor: theme.colors.elevation.level5 }}
        save='value'
      />
    </View>

  )
}

export default RiskQualification
