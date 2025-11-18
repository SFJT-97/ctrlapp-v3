import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useQuery, gql } from '@apollo/client'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Searchbar, useTheme, ActivityIndicator, Title } from 'react-native-paper'
import { useRouter } from 'expo-router'

const MY_BUSINESS_UNITS_COMPANY = gql`
  query MyBusinessUnitsCompany {
    myBusinessUnitsCompany {
      idCompanyBusinessUnit
      idCompany
      companyName
      companyBusinessUnitDescription
    }
  }
`
const BottomSheetBU = ({ visible, onClose }) => {
  const theme = useTheme()
  const router = useRouter()
  const bottomSheetRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Snap points for bottom sheet (25% and 75% of screen height)
  const snapPoints = useMemo(() => ['25%', '75%'], [])

  // Fetch business units
  const { data, loading, error } = useQuery(MY_BUSINESS_UNITS_COMPANY, {
    skip: !visible, // Skip query if sheet is closed
    onError: (err) => console.warn('Query error:', err.message)
  })

  // Filter business units based on search query
  const filteredBusinessUnits = useMemo(() => {
    if (!data?.myBusinessUnitsCompany) return []
    if (!searchQuery) return data.myBusinessUnitsCompany
    const lowerQuery = searchQuery.toLowerCase()
    return data.myBusinessUnitsCompany.filter(
      (bu) =>
        bu.companyBusinessUnitDescription.toLowerCase().includes(lowerQuery) ||
        bu.companyName.toLowerCase().includes(lowerQuery)
    )
  }, [data, searchQuery])

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(1) // Open to 75%
    } else {
      bottomSheetRef.current?.close()
    }
  }, [visible])

  // Handle search query change
  const onChangeSearch = useCallback((query) => setSearchQuery(query), [])

  // Handle business unit selection
  const onSelectBusinessUnit = useCallback(
    (idCompanyBusinessUnit) => {
      onClose() // Close sheet
      router.push(`/business-unit/${idCompanyBusinessUnit}`) // Navigate (adjust path as needed)
    },
    [onClose, router]
  )

  // Render each business unit item
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: theme.colors.surface }]}
        onPress={() => onSelectBusinessUnit(item.idCompanyBusinessUnit)}
      >
        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
          {item.companyBusinessUnitDescription}
        </Text>
        <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {item.companyName}
        </Text>
      </TouchableOpacity>
    ),
    [theme, onSelectBusinessUnit]
  )

  // Handle sheet close
  const handleSheetChanges = useCallback(
    (index) => {
      if (index === -1) onClose() // Call onClose when sheet is fully closed
    },
    [onClose]
  )

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 1 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurface }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>
          Business Units
        </Title>
        <Searchbar
          placeholder='Search by description or company'
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ color: theme.colors.onSurface }}
          iconColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
        {loading
          ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={theme.colors.primary} />
            </View>
            )
          : error
            ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  Error: {error.message.includes('Authentication') ? 'Please log in' : error.message}
                </Text>
              </View>
              )
            : filteredBusinessUnits.length === 0
              ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                    No business units found
                  </Text>
                </View>
                )
              : (
                <FlatList
                  data={filteredBusinessUnits}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.idCompanyBusinessUnit}
                  contentContainerStyle={styles.listContainer}
                  keyboardShouldPersistTaps='handled'
                />
                )}
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2
  },
  itemContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  itemSubtitle: {
    fontSize: 14,
    marginTop: 4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  listContainer: {
    paddingBottom: 16
  }
})

export default BottomSheetBU
