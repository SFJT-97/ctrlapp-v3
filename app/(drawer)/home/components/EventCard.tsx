import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native'
import { Card, useTheme, Divider } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { gql, useMutation, useQuery } from '@apollo/client'

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

const colors = {
  risk: {
    0: '#FF0000',
    1: '#FFA500',
    2: '#008000',
    null: '#808080'
  },
  solution: {
    0: '#FF0000',
    1: '#FFA500',
    2: '#008000',
    null: '#808080'
  }
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const theme = useTheme()
  const router = useRouter()
  const [getURL] = useMutation(getSignedUrlFromCacheQ)
  const [loaded, setLoaded] = useState(false)
  const [imageKeys, setImageKeys] = useState<string[]>([])

  const eventData = item.result || {}
  const riskData = item.risk || {}
  const idTicketNew = eventData.idTicketNew

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

  const renderImages = useCallback(() => {
    if (!loaded) {
      return (
        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
        </View>
      )
    }

    // FIXED: Match image border radius to card (top corners only)
    const topBorderRadius = 16

    if (imageKeys.length === 0 || (imageKeys.length === 1 && imageKeys[0] === randomPlaceholder)) {
      return (
        <View style={{ width: '100%', height: 300 }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius, borderTopRightRadius: topBorderRadius }}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            source={{ uri: randomPlaceholder }}
            resizeMode='cover'
          />
        </View>
      )
    } else if (imageKeys.length === 1) {
      return (
        <View style={{ width: '100%', height: 400 }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius, borderTopRightRadius: topBorderRadius }}
            style={{ width: '100%', height: '100%' }}
            source={{ uri: imageKeys[0] }}
            resizeMode='cover'
          />
        </View>
      )
    } else if (imageKeys.length === 2) {
      return (
        <View style={{ flexDirection: 'row', width: '100%', height: 300 }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius }}
            style={{ flex: 1, height: '100%' }}
            source={{ uri: imageKeys[0] }}
            resizeMode='cover'
          />
          <ImageBackground
            imageStyle={{ borderTopRightRadius: topBorderRadius }}
            style={{ flex: 1, height: '100%' }}
            source={{ uri: imageKeys[1] }}
            resizeMode='cover'
          />
        </View>
      )
    } else {
      return (
        <View style={{ flexDirection: 'row', width: '100%', height: 300 }}>
          <ImageBackground
            imageStyle={{ borderTopLeftRadius: topBorderRadius }}
            style={{ flex: 2, height: '100%' }}
            source={{ uri: imageKeys[0] }}
            resizeMode='cover'
          />
          <View style={{ flex: 1 }}>
            <ImageBackground
              imageStyle={{ borderTopRightRadius: topBorderRadius }}
              style={{ flex: 1, height: '50%' }}
              source={{ uri: imageKeys[1] }}
              resizeMode='cover'
            />
            <ImageBackground
              imageStyle={{}}
              style={{ flex: 1, height: '50%' }}
              source={{ uri: imageKeys[2] }}
              resizeMode='cover'
            />
          </View>
        </View>
      )
    }
  }, [imageKeys, loaded, randomPlaceholder, theme.colors.primary])

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

  const riskColor = riskData.RiskDot !== null && riskData.RiskDot !== undefined
    ? colors.risk[riskData.RiskDot as keyof typeof colors.risk] || colors.risk.null
    : undefined

  const solutionColor = riskData.SolutionDot !== null && riskData.SolutionDot !== undefined
    ? colors.solution[riskData.SolutionDot as keyof typeof colors.solution] || colors.solution.null
    : undefined

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

export default EventCard

