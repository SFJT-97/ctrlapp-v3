// Builtin modules
import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { Link } from 'expo-router'
import { Icon } from 'react-native-paper'

// Custom modules
import { showedName } from '../../../../../globals/functions/functions'

const CardAI = ({ defaultValues }) => {
  const {
    me,
    allMyCompanyTicketsNew
  } = defaultValues

  const [ticketsAcount, setTicketsAcount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (allMyCompanyTicketsNew && me) {
      setTicketsAcount(Number(allMyCompanyTicketsNew) + 1)
    }
    setLoaded(true)
  }, [])
  return (
    <View>
      {loaded && (
        <View style={styles.buttonContainer}>
          <Link
            href={{
              pathname: '/report/newvoice/[index]',
              params: { ticketsAcount, name: showedName(me?.firstName, me?.lastName) || 'unknown', defaultValues: JSON.stringify(defaultValues) }
            }}
            asChild
          >

            <TouchableOpacity style={styles.button}>
              <View style={styles.button}>
                <Icon source='text-to-speech' size={50} color='#FFFFFF' style={{ paddingBottom: 5 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, paddingTop: 5 }}>New Voice Event</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  )
}

export default CardAI

const styles = StyleSheet.create({
  buttonContainer: {
    width: 175,
    height: 175,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3
  },
  button: {
    borderRadius: 25,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#006A6A'
  }
})
