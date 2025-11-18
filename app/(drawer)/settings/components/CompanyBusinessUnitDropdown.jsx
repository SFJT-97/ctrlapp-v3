// ==> 2024-10-02
// Builtin Modules
import { useState } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

// Custom modules

const CompanyBusinessUnitDropdown = ({ myCompanySectors, setCompanySector, companySectorValue, setSelectedStandardSector }) => {
  const theme = useTheme()
  const [value, setValue] = useState(companySectorValue)
  let companySectors
  try {
    companySectors = myCompanySectors?.myBusinessUnitsCompany.map(el => {
      return (
        {
          key: el.idCompanyBusinessUnit,
          value: el.companyBusinessUnitDescription
        }
      )
    })
  } catch (error) {
    // return
  }
  const handleSelectItem = (val) => {
    const temp = myCompanySectors?.myBusinessUnitsCompany?.filter(f => f.companyBusinessUnitDescription === val)
    // setCompanySector(temp)
    setSelectedStandardSector(temp[0]?.companyBusinessUnitDescription)
    setValue(temp[0]?.companyBusinessUnitDescription)
  }

  return (
    <View style={{ rowGap: 10 }}>
      <SelectList
        setSelected={(val) => handleSelectItem(val)}
        placeholder={companySectorValue !== '-' ? value : 'Select Option'}
        data={companySectors || []}
        save='value'
        boxStyles={value ? { backgroundColor: theme.colors.elevation.level5 } : undefined}
      />
    </View>

  )
}

export default CompanyBusinessUnitDropdown
