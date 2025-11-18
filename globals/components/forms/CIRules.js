/**
 * Custom Input Rules (works for text input)
 * @param {*} field . Refers to the field in the input component
 * @param {*} minimunLength .
 * @param {*} isRequired .
 * @returns. true or false
 */
export const CIRules = (field, minimunLength = 0, isRequired = true) => {
  let result = {}
  if (isRequired) {
    if (minimunLength > 0) {
      result = { required: field + ' is required', minLength: { value: minimunLength, message: 'Minimum length cannot be less than ' + minimunLength } }
    } else {
      result = { required: field + ' is required' }
    }
  } else {
    if (minimunLength > 0) {
      result = { minLength: { value: minimunLength, message: 'minimum Length cannot be less than ' + minimunLength } }
    }
  }
  return result
}

/**
 * Custom Input Rules for number inputs
 * @param {*} field . Refers to the field in the input component
 * @param {*} isRequired . boolean
 * @param {*} min .
 * @param {*} max .
 * @returns true or false
 */
export const CIRulesNumber = (field, isRequired = true, min = 50, max = 500) => {
  let result = {}
  if (isRequired) {
    result = {
      required: field + ' is required',
      min: { value: min, message: field + ' cannot be smaller than ' + min },
      max: { value: max, message: field + ' cannot be bigger than ' + max }
    }
  } else {
    result = {
      min: { value: min, message: field + ' cannot be smaller than ' + min },
      max: { value: max, message: field + ' cannot be bigger than ' + max }
    }
  }
  return result
}

/*
  rules={{
    validate: value => value === something || ' values do not match'  // Colocar || al final, ==> cuando no suceda eso, haga lo que está a la derecha.
  }}
*/
