import React from 'react'
import { View, FlatList, Image, StyleSheet, Dimensions } from 'react-native'
import { Card, Text, Avatar, IconButton } from 'react-native-paper'
import { Video } from 'expo-av'
import { DEFAULT_IMAGE2 } from '../../../../../globals/variables/globalVariables'

const { width } = Dimensions.get('window')

const CardXComponent = ({ media }) => {
  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return (
        <Image
          source={{ uri: item.uri }}
          style={styles.media}
        />
      )
    }

    if (item.type === 'video') {
      return (
        <Video
          source={{ uri: item.uri }}
          style={styles.media}
          useNativeControls
          resizeMode='cover'
          isLooping={false}
          shouldPlay={false} // no autoplay
        />
      )
    }

    return null
  }

  return (
    <Card style={styles.card}>
      <Card.Title
        title='Nik'
        subtitle='@Nikgaturro · 2h'
        left={(props) => (
          <Avatar.Image
            {...props}
            source={{ uri: DEFAULT_IMAGE2 }}
          />
        )}
      />
      <Card.Content>
        <Text>
          <Text style={styles.hashtag}>#BuenLunes </Text>
          Hay un Gaturro suelto en NY
        </Text>
      </Card.Content>

      {media?.length > 0 && (
        <FlatList
          data={media}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          nestedScrollEnabled // importante si lo usás dentro de una FlatList
        />
      )}

      <View style={styles.iconRow}>
        <IconButton icon='comment-outline' size={20} />
        <Text>4</Text>
        <IconButton icon='repeat' size={20} />
        <Text>2</Text>
        <IconButton icon='heart-outline' size={20} />
        <Text>40</Text>
        <IconButton icon='eye-outline' size={20} />
        <Text>832</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 10
  },
  hashtag: {
    color: '#1DA1F2'
  },
  carousel: {
    marginTop: 10
  },
  media: {
    width: width - 40,
    height: 250,
    borderRadius: 10,
    marginHorizontal: 10,
    backgroundColor: '#000' // para que el video tenga fondo si tarda en cargar
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10
  }
})

export default CardXComponent
