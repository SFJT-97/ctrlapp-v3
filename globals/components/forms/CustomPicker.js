import { View, StyleSheet, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'

const CustomPicker = ({
  control,
  name,
  items,
  title = name,
  selectedValue = items[0]
}) => {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { value, onChange, onBlur, name, ref } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              onBlur={onBlur}
              style={styles.input}
            >
              {items.map(el => {
                return (
                  <Picker.Item label={el.toString()} key={el} value={el} />)
              })}
            </Picker>
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

export default CustomPicker
