import React, { useMemo, useCallback, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, useTheme, Chip, Button, Divider, IconButton } from 'react-native-paper'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'

interface ActiveFilters {
  type?: string[]
  riskQualification?: string[]
  solutionType?: string[]
  classificationDescription?: string[]
  companySectorDescription?: string[]
  subType?: string[]
  status?: string[]
}

interface FilterDrawerProps {
  bottomSheetRef: React.RefObject<any>
  activeFilters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
  allEvents: any[]
  allUsers: any[]
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  bottomSheetRef,
  activeFilters,
  onFiltersChange,
  allEvents,
  allUsers
}) => {
  const theme = useTheme()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    type: true,
    riskQualification: true,
    solutionType: true,
    classificationDescription: false,
    companySectorDescription: false,
    subType: false
  })

  // Extract unique values from all events
  const filterOptions = useMemo(() => {
    const types = new Set<string>()
    const riskQualifications = new Set<string>()
    const solutionTypes = new Set<string>()
    const classificationDescriptions = new Set<string>()
    const companySectorDescriptions = new Set<string>()
    const subTypes = new Set<string>()

    // Ensure allEvents is an array before iterating
    if (Array.isArray(allEvents) && allEvents.length > 0) {
      allEvents.forEach((event) => {
        if (event?.type) types.add(event.type)
        if (event?.riskQualification) riskQualifications.add(event.riskQualification)
        if (event?.solutionType) solutionTypes.add(event.solutionType)
        if (event?.classificationDescription) classificationDescriptions.add(event.classificationDescription)
        if (event?.companySectorDescription) companySectorDescriptions.add(event.companySectorDescription)
        if (event?.subType) subTypes.add(event.subType)
      })
    }

    return {
      types: Array.from(types).sort(),
      riskQualifications: Array.from(riskQualifications).sort(),
      solutionTypes: Array.from(solutionTypes).sort(),
      classificationDescriptions: Array.from(classificationDescriptions).sort(),
      companySectorDescriptions: Array.from(companySectorDescriptions).sort(),
      subTypes: Array.from(subTypes).sort()
    }
  }, [allEvents])

  const toggleFilter = useCallback((category: keyof ActiveFilters, value: string) => {
    const safeFilters = activeFilters || {}
    const currentValues = safeFilters[category] || []
    const isSelected = currentValues.includes(value)

    const newFilters = {
      ...safeFilters,
      [category]: isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
    }

    // Remove empty arrays
    Object.keys(newFilters).forEach((key) => {
      const k = key as keyof ActiveFilters
      if (Array.isArray(newFilters[k]) && newFilters[k]?.length === 0) {
        delete newFilters[k]
      }
    })

    onFiltersChange(newFilters)
  }, [activeFilters, onFiltersChange])

  const clearAllFilters = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  const getActiveFilterCount = useCallback(() => {
    if (!activeFilters || typeof activeFilters !== 'object') return 0
    return Object.values(activeFilters).reduce((count, arr) => count + (arr?.length || 0), 0)
  }, [activeFilters])

  const toggleSection = useCallback((category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }, [])

  const renderFilterSection = useCallback((
    title: string,
    category: keyof ActiveFilters,
    options: string[]
  ) => {
    if (options.length === 0) return null

    const safeFilters = activeFilters || {}
    const selectedValues = safeFilters[category] || []
    const selectedCount = selectedValues.length

    const isExpanded = expandedSections[category] !== false // Default to true if not set

    return (
      <View style={styles.filterSection}>
        <TouchableOpacity
          onPress={() => toggleSection(category)}
          style={styles.sectionHeaderContainer}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={[styles.sectionHeader, { color: theme.colors.onSurface, flex: 1 }]}>
              {title} {selectedCount > 0 && `(${selectedCount})`}
            </Text>
            <IconButton
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              style={{ margin: 0 }}
            />
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.horizontalScrollContent}
            style={styles.horizontalScroll}
          >
            {options.map((option) => {
              const isSelected = selectedValues.includes(option)
              // Capitalize the option text for display
              const displayText = option
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
              return (
                <Chip
                  key={option}
                  selected={isSelected}
                  onPress={() => toggleFilter(category, option)}
                  compact
                  style={[
                    styles.filterChip,
                    { marginRight: 8 },
                    isSelected && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                  textStyle={{
                    fontSize: 12,
                    color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface
                  }}
                >
                  {displayText}
                </Chip>
              )
            })}
          </ScrollView>
        )}
      </View>
    )
  }, [activeFilters, theme, toggleFilter, expandedSections, toggleSection])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  const activeCount = getActiveFilterCount()

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['90%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Filters {activeCount > 0 && `(${activeCount})`}
          </Text>
          <Button
            mode='text'
            onPress={clearAllFilters}
            disabled={activeCount === 0}
            textColor={theme.colors.primary}
          >
            Clear All
          </Button>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {renderFilterSection('Type', 'type', filterOptions.types)}
          {renderFilterSection('Risk Qualification', 'riskQualification', filterOptions.riskQualifications)}
          {renderFilterSection('Solution Type', 'solutionType', filterOptions.solutionTypes)}
          {renderFilterSection('Classification', 'classificationDescription', filterOptions.classificationDescriptions)}
          {renderFilterSection('Company Sector', 'companySectorDescription', filterOptions.companySectorDescriptions)}
          {renderFilterSection('Sub Type', 'subType', filterOptions.subTypes)}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '600'
  },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1
  },
  filterSection: {
    marginBottom: 20
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '600'
  },
  horizontalScroll: {
    maxHeight: 80 // 2 rows of chips (32px height + margins)
  },
  horizontalScrollContent: {
    paddingRight: 16,
    paddingVertical: 4
  },
  filterChip: {
    height: 32,
    marginVertical: 4
  }
})

export default FilterDrawer
export type { ActiveFilters }

