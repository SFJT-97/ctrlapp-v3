import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Controller } from 'react-hook-form'
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker'

/*
  mode='calendar'
  mode='datepicker'
  mode='monthYear'
  mode='time'

*/

const CustomDatePicker = ({
  name,
  control,
  placeholder = 'Select Date',
  value = new Date().getDate(),
  visible = false,
  mode = 'calendar'
}) => {
  const today = new Date()
  const startDate = getFormatedDate(today.setDate(today.getDate()), 'YYYY/MM/DD')
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(false)
  const handleOpen = () => {
    setOpen(visible)
  }
  const handleChange = (propDate) => {
    setDate(propDate)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <>
          <View style={[styles.container, { borderColor: error ? 'red' : '#e8e8e8' }]}>

            <DatePicker
              mode={mode}
              selected={date}
              onChange={onChange}
              onDateChange={handleChange}
              value={value}
              startDate={startDate}
            />

          </View>
        </>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5
})

export default CustomDatePicker

// const CustomDatePicker = ({
//   name,
//   control,
//   placeholder = 'Select Date',
//   value = getToday(),
//   visible = false,
//   mode = 'calendar'
// }) => {
//   const today = new Date()
//   const startDate = getFormatedDate(today.setDate(today.getDate()), 'YYYY/MM/DD')
//   const [open, setOpen] = useState(false)
//   const [date, setDate] = useState(false)

//   const handleOpen = () => {
//     setOpen(visible)
//   }
//   const handleChange = (propDate) => {
//     setDate(propDate)
//   }
//   return (
//     <>
//       <View style={styles.container}>
//         <TouchableOpacity onPress={handleOpen}>
//           <Text>Open</Text>
//         </TouchableOpacity>
//         <Modal
//           animationType='slide'
//           transparent
//           visible={open}
//         >
//           <View style={styles.centeredView}>
//             <View style={styles.modalView}>
//               <TouchableOpacity onPress={handleOpen}>
//                 <Text>Close</Text>
//               </TouchableOpacity>
//               <Controller
//                 control={control}
//                 name={name}
//                 render={({ field: { value, onChange } }) => (
//                   <DatePicker
//                     mode={mode}
//                     selected={date}
//                     onChange={onChange}
//                     onDateChange={handleChange}
//                     placeholder={placeholder}
//                     value={value}
//                     startDate={startDate}
//                   />
//                 )}
//               />
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </>
//   )
// }

// const CustomDatePicker = ({
//   name,
//   control,
//   placeholder,
//   value,
//   visible,
//   mode = 'calendar'
// }) => {
//   const [open, setOpen] = useState(false)
//   const [date, setDate] = useState(false)

//   const handleOpen = () => {
//     setOpen(visible)
//   }
//   const handleChange = (propDate) => {
//     setDate(propDate)
//   }
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleOpen}>
//         <Text>Open</Text>
//       </TouchableOpacity>
//       <Modal
//         animationType='slide'
//         transparent
//         visible={open}
//       >
//         <View style={styles.centeredView}>
//           <View style={styles.modalView}>
//             <TouchableOpacity onPress={handleOpen}>
//               <Text>Close</Text>
//             </TouchableOpacity>
//             <DatePicker
//               mode={mode}
//               selected={date}
//               onDateChange={handleChange}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   )
// }
