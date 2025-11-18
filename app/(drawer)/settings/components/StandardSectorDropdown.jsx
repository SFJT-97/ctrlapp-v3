// ==> 2024-10-02
// Builtin Modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

// Custom modules

const StandardSectorDropdown = ({ myCompanySectors, selectedStandardSector, setSelectedStandardSector }) => {
  const theme = useTheme()
  const [value, setValue] = useState(selectedStandardSector)

  let companySectors // Variable for fulling list with the correspondent format

  try {
    companySectors = myCompanySectors.map(el => {
      return (
        {
          key: el.idStandardSector,
          value: el.standardSectorDescription
        }
      )
    })
  } catch (error) {
    // return
  }

  useEffect(() => {
    if (selectedStandardSector) {
      setValue(selectedStandardSector)
    }
    // console.log(selectedStandardSector)
  }, [value || selectedStandardSector])

  return (
    <View style={{ rowGap: 10 }}>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          setSelectedStandardSector(val)
        }}
        placeholder={selectedStandardSector !== '' ? selectedStandardSector : 'Select Option'}
        data={companySectors || []}
        save='value'
        boxStyles={value ? { backgroundColor: theme.colors.elevation.level5 } : undefined}
      />
    </View>

  )
}

export default StandardSectorDropdown
