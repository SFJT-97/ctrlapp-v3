import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { TextInput } from 'react-native-paper'

const CustomPaperInput = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry,
  keyboardType,
  extraTitle = '',
  readOnly = false,
  isDate = false,
  visible = true,
  isEmail = false
}) => {
  const DATE_PATTERN = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/
  const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <>
          <View style={[styles.container, { borderColor: error ? 'red' : '#e8e8e8' }]}>
            {extraTitle !== '' ? <Text style={styles.text}>{extraTitle}</Text> : <Text style={styles.text}>{placeholder}</Text>}
            <TextInput
              value={keyboardType !== null ? String(value) : value}
              onChangeText={onChange}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={placeholder}
              style={styles.input}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType !== null ? keyboardType : 'default'}
              readOnly={readOnly}
              pattern={isDate ? DATE_PATTERN : isEmail ? EMAIL_PATTERN : ''}
            />
          </View>
          {error && <Text style={{ color: 'red', alignSelf: 'stretch' }}> {error.message || 'Error...'} </Text>}
        </>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    width: '100%',
    borderColor: '#e8e8e8',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderBottomColor: 'lightblue'
  },
  input: {},
  text: {
    color: 'gray'
  }
})

export default CustomPaperInput
