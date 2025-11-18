// Buitlin modules
import { useState } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { MultipleSelectList } from 'react-native-dropdown-select-list'

const MultipleSelect = ({ fields, setFieldsSelected }) => {
  const theme = useTheme()

  const [selected, setSelected] = useState([])

  const fieldsArray = fields?.map(el => {
    return (
      {
        key: el.toString(),
        value: el.toString(),
        disabled: el.toString() === 'type'
      }
    )
  })

  const defaultIndex = fieldsArray?.findIndex(option => option.key === 'type')

  return (
    <View style={{ rowGap: 10 }}>
      <MultipleSelectList
        setSelected={(val) => {
          setSelected(val)
          setFieldsSelected(val)
        }}
        onSelect={() => console.log(selected)}
        placeholder='Select Option'
        data={fieldsArray}
        save='value'
        badgeStyles={theme.colors.primary}
        defaultOption={defaultIndex !== -1 ? fieldsArray[defaultIndex] : null}
      />
    </View>

  )
}

export default MultipleSelect
