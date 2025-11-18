// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { SelectList } from 'react-native-dropdown-select-list'

const SolutionState = ({ allSolutionsStates, SetSolutionState, solutionStateValue, fromAIReport }) => {
  const theme = useTheme()

  const [value, setValue] = useState('')

  const [solutionState, setSolutionstate] = useState({ key: 0, value: '' })

  useEffect(() => {
    if (allSolutionsStates) {
      const temp = allSolutionsStates.map(el => {
        return (
          {
            key: el.idSolutionState,
            value: el.solutionStateDescription
          }
        )
      })
      setSolutionstate(temp)
    }
  }, [allSolutionsStates])

  useEffect(() => {
    if (!fromAIReport) {
      setValue(value)
    }
  }, [])

  useEffect(() => {
    if (fromAIReport && solutionStateValue && solutionStateValue !== '-') {
      SetSolutionState(solutionStateValue)
      setValue(solutionStateValue)
    }
  }, [solutionStateValue])

  return (
    <View style={{ rowGap: 10 }}>
      <Text variant='headlineSmall'>Solution State</Text>
      <SelectList
        setSelected={(val) => {
          setValue(val)
          SetSolutionState(val)
        }}
        placeholder={fromAIReport && solutionStateValue !== '-' ? solutionStateValue : 'Select option'}
        data={solutionState}
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

export default SolutionState
