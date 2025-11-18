import { View, StyleSheet } from 'react-native'
import { Controller } from 'react-hook-form'
import { SelectList } from 'react-native-dropdown-select-list'

const CustomSelectList = ({
  control,
  name,
  data,
  setSelected,
  placeholder,
  rules = {},
  save = 'value'
}) => {
  return (
    <>
      <View style={styles.container}>
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { value, onChange } }) => (
            <SelectList
              onSelect={onChange}
              setSelected={(val) => {
                setSelected(val)
              }}
              data={data}
              save={save}
              boxStyles={{ backgroundColor: 'lightgray' }}
              inputStyles={{ fontSize: 14 }}
              dropdownStyles={{ backgroundColor: 'lightgray' }}
              dropdownItemStyles={{ marginHorizontal: 10 }}
              dropdownTextStyles={{ color: 'black' }}
              placeholder={!value ? placeholder : value}
            />
          )}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    flex: 0,
    flexDirection: 'column',

    borderColor: '#e8e8e8',
    borderWidth: 1,
    borderRadius: 5,

    paddingHorizontal: 10,
    marginVertical: 5
  },
  input: {},
  text: {
    color: 'gray'
  }
})

export default CustomSelectList
