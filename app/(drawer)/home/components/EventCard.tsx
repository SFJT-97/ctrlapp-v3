import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { View, TouchableOpacity, ImageBackground, ActivityIndicator, Dimensions, StyleSheet } from 'react-native'
import { Card, useTheme, Divider } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { gql, useMutation, useQuery } from '@apollo/client'
import Carousel from 'react-native-reanimated-carousel'

import EventCardHeader from './EventCardHeader'
import EventCardFooter from './EventCardFooter'
import { DEFAULT_IMAGE } from '../../../../globals/variables/globalVariables'

const allCommentsFromTicketNewQ = gql`
  query AllCommentsFromTicketNew($idTicketNew: ID!) {
    allCommentsFromTicketNew(idTicketNew: $idTicketNew) {
      idTicketNewComment
    }
  }
`

const getSignedUrlFromCacheQ = gql`
  mutation GetSignedUrlFromCache($idSiMMediaURL: ID!) {
    getSignedUrlFromCache(idSiMMediaURL: $idSiMMediaURL) {
      signedUrl
    }
  }
`

interface EventCardProps {
  item: {
    result?: {
      idTicketNew?: string
      classification?: string
      classificationDescription?: string
      companySectorDescription?: string
      dateTimeEvent?: string | number
      ticketImage1?: string
      ticketImage2?: string
      ticketImage3?: string
      ticketCustomDescription?: string
      riskQualification?: string
      solutionType?: string
      type?: string
      [key: string]: unknown
    }
    risk?: {
      RiskDot?: number | null
      SolutionDot?: number | null
    }
  }
  onPress?: () => void
}

const DEFAULT_PLACEHOLDER = DEFAULT_IMAGE

// Red scale for risk qualification (danger levels)
const riskColors = {
  0: '#8B0000', // Dark red - Catastrophic/Extremely Dangerous/Very Dangerous
  1: '#DC143C', // Crimson - Dangerous/Very Serious
  2: '#FF6347', // Tomato - Serious/Warning
  3: '#FFA07A', // Light salmon - Low warning/Inconsequential/Secure Event
  null: '#FFE4E1' // Misty rose - default/unknown
}

// Yellow scale for solution type (action levels)
const solutionColors = {
  0: '#FFFF99', // Light yellow - Resolved
  1: '#FFD700', // Gold - Pending action
  2: '#FFA500', // Orange - Partial action
  3: '#FF8C00', // Dark orange - Immediate action
  null: '#FFE4B5' // Moccasin - default/unknown
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const theme = useTheme()
  const router = useRouter()
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [imageKeys, setImageKeys] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef(null)

  const eventData = item.result || {}
  const riskData = item.risk || {}
  const idTicketNew = eventData.idTicketNew
  const screenWidth = Dimensions.get('window').width
  const carouselWidth = screenWidth - 24 // Account for card margins (12px each side)

  // Fetch comment count
  const { data: commentsData } = useQuery(allCommentsFromTicketNewQ, {
    variables: { idTicketNew },
    skip: !idTicketNew,
    fetchPolicy: 'cache-and-network'
  })

  const commentCount = commentsData?.allCommentsFromTicketNew?.length || 0

  const randomPlaceholder = useMemo(() => DEFAULT_PLACEHOLDER, [])

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      const temp: string[] = []
      
      const imageFields = [
        eventData.ticketImage1,
        eventData.ticketImage2,
        eventData.ticketImage3
      ]

      for (const imageField of imageFields) {
        if (imageField) {
          try {
            const fileName = imageField.split('/').pop()
            if (fileName) {
              const result = await getURL({ variables: { idSiMMediaURL: fileName } })
              if (result?.data?.getSignedUrlFromCache?.signedUrl) {
                temp.push(result.data.getSignedUrlFromCache.signedUrl)
              }
            }
          } catch (error) {
            console.error('Error fetching image:', error)
          }
        }
      }

      setImageKeys(temp.length > 0 ? temp : [randomPlaceholder])
      setLoaded(true)
    }

    fetchImages()
  }, [
    eventData.ticketImage1,
    eventData.ticketImage2,
    eventData.ticketImage3,
    getURL,
    randomPlaceholder
  ])

  const topBorderRadius = 16
  const carouselHeight = 400

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const renderCarouselItem = useCallback(({ item: imageUri, index }: { item: string; index: number }) => {
    const totalImages = imageKeys.length
    const isFirst = index === 0
    const isLast = index === totalImages - 1
    
    return (
      <ImageBackground
        imageStyle={{
          borderTopLeftRadius: isFirst ? topBorderRadius : 0,
          borderTopRightRadius: isLast ? topBorderRadius : 0
        }}
        style={{ width: carouselWidth, height: carouselHeight }}
        source={{ uri: imageUri }}
        resizeMode='cover'
      />
    )
  }, [carouselWidth, carouselHeight, imageKeys])

  const renderPaginationDots = useCallback(() => {
    if (imageKeys.length <= 1) return null

    return (
      <View style={styles.paginationContainer}>
        {imageKeys.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant
              }
            ]}
          />
        ))}
      </View>
    )
  }, [imageKeys.length, currentIndex, theme.colors.primary, theme.colors.surfaceVariant])

  const renderImages = useCallback(() => {
    if (!loaded) {
      return (
        <View style={{ height: carouselHeight, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
      )
    }

    // No images or only placeholder
    if (imageKeys.length === 0 || (imageKeys.length === 1 && imageKeys[0] === randomPlaceholder)) {
      return (
        <View style={{ width: '100%', height: carouselHeight }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius, borderTopRightRadius: topBorderRadius }}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            source={{ uri: randomPlaceholder }}
            resizeMode='cover'
          />
        </View>
      )
    }

    // Single image - no carousel needed
    if (imageKeys.length === 1) {
      return (
        <View style={{ width: '100%', height: carouselHeight, position: 'relative' }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius, borderTopRightRadius: topBorderRadius }}
            style={{ width: '100%', height: '100%' }}
            source={{ uri: imageKeys[0] }}
            resizeMode='cover'
          />
        </View>
      )
    }

    // Multiple images - use carousel
    return (
      <View style={{ width: '100%', height: carouselHeight, position: 'relative' }}>
        <Carousel
          ref={carouselRef}
          loop={false}
          width={carouselWidth}
          height={carouselHeight}
          data={imageKeys}
          scrollAnimationDuration={300}
          onSnapToItem={handleIndexChange}
          renderItem={renderCarouselItem}
        />
        {renderPaginationDots()}
      </View>
    )
  }, [imageKeys, loaded, randomPlaceholder, theme.colors.primary, carouselWidth, carouselHeight, handleIndexChange, renderCarouselItem, renderPaginationDots])

  const handleCardPress = (): void => {
    if (onPress) {
      onPress()
    } else if (eventData.idTicketNew) {
      router.push({
        pathname: '/(drawer)/home/[event]',
        params: eventData as Record<string, string>
      })
    }
  }

  // Red scale for risk qualification
  const riskColorMap = {
    0: '#8B0000', // Dark red - Catastrophic/Extremely Dangerous/Very Dangerous
    1: '#DC143C', // Crimson - Dangerous/Very Serious
    2: '#FF6347', // Tomato - Serious/Warning
    3: '#FFA07A', // Light salmon - Low warning/Inconsequential/Secure Event
    null: '#FFE4E1' // Misty rose - default/unknown
  }

  // Yellow scale for solution type
  const solutionColorMap = {
    0: '#FFFF99', // Light yellow - Resolved
    1: '#FFD700', // Gold - Pending action
    2: '#FFA500', // Orange - Partial action
    3: '#FF8C00', // Dark orange - Immediate action
    null: '#FFE4B5' // Moccasin - default/unknown
  }

  // Use riskColor/solutionColor from riskData if available, otherwise calculate from RiskDot/SolutionDot
  const riskColor = riskData.riskColor || (riskData.RiskDot !== null && riskData.RiskDot !== undefined
    ? riskColorMap[riskData.RiskDot as keyof typeof riskColorMap] || riskColorMap.null
    : undefined)

  const solutionColor = riskData.solutionColor || (riskData.SolutionDot !== null && riskData.SolutionDot !== undefined
    ? solutionColorMap[riskData.SolutionDot as keyof typeof solutionColorMap] || solutionColorMap.null
    : undefined)

  return (
    <Card
      style={{
        marginVertical: 8,
        marginHorizontal: 12,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        elevation: 2
      }}
    >
      <View style={{ borderRadius: 16, overflow: 'hidden' }}>
        <EventCardHeader
          classification={eventData.classification}
          classificationDescription={eventData.classificationDescription}
          companySectorDescription={eventData.companySectorDescription}
          dateTimeEvent={eventData.dateTimeEvent}
          onPress={handleCardPress}
        />
        <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
          {renderImages()}
        </TouchableOpacity>
        <EventCardFooter
          description={eventData.ticketCustomDescription}
          riskQualification={eventData.riskQualification}
          solutionType={eventData.solutionType}
          type={eventData.type}
          riskColor={riskColor}
          solutionColor={solutionColor}
          idTicketNew={idTicketNew}
          comments={commentCount}
          onComment={handleCardPress}
          onShare={() => {
            // Placeholder for future share functionality
          }}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8
  }
})

export default EventCard

