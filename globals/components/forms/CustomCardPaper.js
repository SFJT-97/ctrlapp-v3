// Tarjeta armada para reportes
import * as React from 'react'
import { Avatar, Button, Card, Text } from 'react-native-paper'

const LeftContent = props => <Avatar.Icon {...props} icon='star' />

const CustomCardPaper = ({ source }) => {
  if (!source) {
    source = {
      title: 'Chart Title',
      subtitle: 'Chart subtitle',
      withIcons: false,
      withCardActions: false
    }
  }
  return (
    <Card>
      {
        source.withIcons && <Card.Title title={source.title} subtitle={source.subtitle} left={LeftContent} />
      }
      <Card.Content>
        <Text variant='titleLarge'>{source.title}</Text>
        <Text variant='bodyMedium'>{source.subtitle}</Text>
      </Card.Content>
      <Card.Cover source={{ uri: 'https://picsum.photos/700' }} onTouchEnd={() => console.info('-----------------')} />
      {
        source.withCardActions && (
          <Card.Actions>
            <Button>Cancel</Button>
            <Button>Ok</Button>
          </Card.Actions>
        )
      }
    </Card>
  )
}

export default CustomCardPaper
