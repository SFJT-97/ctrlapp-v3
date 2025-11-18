// ==> 2024-10-02
// Builtin Modules
import { useState } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

// Custom modules

const CompanySectorDropdown = ({ myCompanySectors, setCompanySector, companySectorValue, setSelectedStandardSector, setSelectedSectorAux, setSelectedSectorIdAux }) => {
  const theme = useTheme()
  const [value, setValue] = useState(companySectorValue)
  let companySectors
  try {
    companySectors = myCompanySectors?.map(el => {
      return (
        {
          key: el.idCompanySector,
          value: el.companySectorDescription
        }
      )
    })
  } catch (error) {
    // return
  }

  const handleSelectItem = (val) => {
    const temp = myCompanySectors?.filter(f => f.companySectorDescription === val)
    // console.log('myCompanySectors\n', myCompanySectors)
    // console.log('temp\n', temp)
    // console.log('val\n', val)
    setCompanySector(temp)
    setSelectedStandardSector(temp[0]?.standardSectorDescription)
    setValue(temp[0]?.standardSectorDescription)
    setSelectedSectorAux(temp[0]?.companySectorDescription)
    setSelectedSectorIdAux(temp[0]?.idCompanySector)
  }

  return (
    <View style={{ rowGap: 10 }}>
      <SelectList
        setSelected={(val) => handleSelectItem(val)}
        placeholder={companySectorValue !== '-' ? value : 'Select Option'}
        data={companySectors || []}
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
