// Builtin Modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

// Custom modules
import { GetLocation, pointInCompanySector } from '../../../../../globals/components/getLocation'

const CompanySectorDropdown = ({ myCompanySectors, setCompanySector, companySectorValue, fromAIReport }) => {
  const theme = useTheme()
  const [value, setValue] = useState(undefined)
  const [locating, setLocating] = useState(true)
  const [companySectors, setCompanySectors] = useState([{ key: 0, value: '' }])
  const location = GetLocation()
  useEffect(() => {
    if (myCompanySectors) {
      const temp = myCompanySectors?.map(el => {
        return (
          {
            key: el.idCompanySector,
            value: el.companySectorDescription
          }
        )
      })
      setCompanySectors(temp)
    }
  }, [myCompanySectors])
  useEffect(() => {
    if (!fromAIReport) {
      const result = pointInCompanySector(myCompanySectors, location, setValue, setCompanySector, setLocating)
      setCompanySector(result?.companySectorDescription)
    } else {
      if (companySectorValue && companySectorValue !== '-') {
        setCompanySector(companySectorValue)
        setValue(companySectorValue)
      }
    }
  }, [location])
  useEffect(() => {
    if (!fromAIReport) setCompanySector(value)
  }, [value])
  useEffect(() => {
    if (!fromAIReport) setValue(value)
  }, [])
  useEffect(() => {
    if (fromAIReport && companySectorValue & companySectorValue !== '-') {
      setCompanySector(companySectorValue)
      setValue(companySectorValue)
    }
  }, [companySectorValue])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall' style={locating && { color: 'red' }}>
        Company Sectors
        {locating && <Text style={{ fontSize: 12 }}> getting your location...</Text>}
      </Text>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          setCompanySector(val)
        }}
        placeholder={fromAIReport && companySectorValue !== '-' ? value : 'Select Options'}
        data={companySectors}
        save='value'
        dropdownTextStyles={{ color: theme.colors.onBackground }}
        inputStyles={{ color: theme.colors.onBackground }} // texto adentro de la caja
        disabledItemStyles={{ backgroundColor: theme.colors.background }}
        disabledTextStyles={{ color: theme.colors.onSurfaceDisabled }}
        boxStyles={{ backgroundColor: theme.colors.elevation.level5 }}
      />
    </View>

  )
}

export default CompanySectorDropdown
