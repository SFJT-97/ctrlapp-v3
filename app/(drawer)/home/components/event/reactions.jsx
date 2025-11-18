// ==> 2024-10-02
// Builtin modules
import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { useTheme, IconButton, Chip } from 'react-native-paper'
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client'

// Custom modules
import { useMe } from '../../../../../context/hooks/userQH'
import { numbToEng } from '../../../../../globals/functions/functions'

const findTicketNewLikeQ = gql`
query FindTicketNewLike($idTicketNew: ID!) {
  findTicketNewLike(idTicketNew: $idTicketNew) {
    idTicketNewLike
    idTicketNew
    idUser
    companyName
    ticketLike
    ticketDisLike
  }
}

`

const addNewTicketNewLikeM = gql`
mutation AddNewTicketNewLike($idTicketNew: ID!, $idUser: ID!, $companyName: String!, $ticketLike: Boolean!, $ticketDisLike: Boolean!) {
  addNewTicketNewLike(idTicketNew: $idTicketNew, idUser: $idUser, companyName: $companyName, ticketLike: $ticketLike, ticketDisLike: $ticketDisLike) {
    idTicketNewLike
    idTicketNew
    idUser
    companyName
    ticketLike
    ticketDisLike
  }
}

`

const editTicketNewLikeM = gql`
mutation EditTicketNewLike($idTicketNewLike: ID!, $ticketLike: Boolean, $ticketDisLike: Boolean) {
  editTicketNewLike(idTicketNewLike: $idTicketNewLike, ticketLike: $ticketLike, ticketDisLike: $ticketDisLike) {
    idTicketNewLike
    idTicketNew
    idUser
    companyName
    ticketLike
    ticketDisLike
  }
}

`

const countTicketsNewLikesQ = gql`
query Query($idTicketNew: ID!) {
  countTicketNewLikes(idTicketNew: $idTicketNew)
}

`

const Reaction = ({ param }) => {
  const parParam = param
  const [findTicketNewLike] = useLazyQuery(findTicketNewLikeQ, { fetchPolicy: 'network-only' })
  const [addNewTicketNewLike] = useMutation(addNewTicketNewLikeM, { fetchPolicy: 'network-only' })
  const [editTicketNewLike] = useMutation(editTicketNewLikeM, { fetchPolicy: 'network-only' })
  const { me } = useMe()
  const [totalLikesAndDislikes, setTotalLikesAndDislikes] = useState(0)
  const countTotalTicketsNewLikes = useQuery(countTicketsNewLikesQ, { variables: { idTicketNew: param?.idTicketNew }, fetchPolicy: 'network-only', pollInterval: 1000 })

  const theme = useTheme()
  const [pressed, setPressed] = useState({
    thumbUp: false,
    thumbDown: false,
    download: false
  })

  const handlePress = (iconName) => {
    let temp
    switch (iconName) {
      case 'thumbUp':
        temp = {
          thumbUp: !pressed.thumbUp,
          thumbDown: false,
          download: false
        }
        break
      case 'thumbDown':
        temp = {
          thumbUp: false,
          thumbDown: !pressed.thumbDown,
          download: false
        }
        break
      default:
        temp = {
          ...pressed,
          [iconName]: !pressed[iconName]
        }
        break
    }
    // console.log('temp', temp)
    setPressed(temp)
    handleReaction(temp, true)
  }

  const handleReaction = async (param, update = false) => {
    // en esta parte se consulta cual fue la reacción previa del usuario a este ticket, si es que la hubo
    let tempResult = null
    try {
      const actualReaction = await findTicketNewLike({
        variables: {
          idTicketNew: parParam.idTicketNew
        }
      })
      // Acá encontró una reacción existente y llena tempResult con sus valores
      if (actualReaction?.data?.findTicketNewLike?.ticketLike !== undefined) {
        tempResult = {
          thumbUp: actualReaction.data.findTicketNewLike.ticketLike,
          thumbDown: actualReaction.data.findTicketNewLike.ticketDisLike,
          download: false,
          idTicketNewLike: actualReaction.data.findTicketNewLike.idTicketNewLike
        }
      }
    } catch (error) {
      console.log('ups... something wrong happening', error)
    }
    // Pregunta si se quiere actualizar o no
    if (update) {
      // Si ya reaccionó antes actualiza, sino agrega
      if (tempResult === null) {
        // acá agrega una reacción
        // En realidad idUser y companyName, los toma el BE directamente del usuario Logueado... esto debería optimizarse a futuro
        try {
          tempResult = await addNewTicketNewLike({
            variables: {
              idTicketNew: parParam.idTicketNew,
              idUser: me.idUser,
              companyName: me.companyName,
              ticketLike: param.thumbUp,
              ticketDisLike: param.thumbDown
            }
          })
        } catch (error) {
          console.log('something did not work!...', error)
        }
      } else {
        // acá edita la reacción actual
        tempResult = await editTicketNewLike({
          variables: {
            idTicketNewLike: tempResult.idTicketNewLike,
            idTicketNew: parParam.idTicketNew,
            ticketLike: param.thumbUp,
            ticketDisLike: param.thumbDown
          }
        })
      }
    }
    if (tempResult?.thumbDown !== undefined && tempResult?.thumbUp !== undefined && !update) {
      // En esta parte, se encontraron resultados previos y solo se quiere pintar las manitos en función de si gustó o no gustó... o ni
      setPressed({
        ...tempResult,
        download: false
      })
    }
  }
  useEffect(() => {
    if (countTotalTicketsNewLikes && !countTotalTicketsNewLikes.loading && !countTotalTicketsNewLikes.error) {
      setTotalLikesAndDislikes(countTotalTicketsNewLikes.data.countTicketNewLikes)
    }
  }, [countTotalTicketsNewLikes])

  useEffect(() => {
    try {
      handleReaction()
    } catch (error) {
    }
  }, [])
  return (
    <View>
      <View style={{ display: 'flex', flexDirection: 'row', columnGap: 20 }}>
        <IconButton
          icon={pressed.thumbUp ? 'thumb-up' : 'thumb-up-outline'}
          iconColor={pressed.thumbUp ? 'green' : theme.colors.primary}
          size={26}
          onPress={() => handlePress('thumbUp')}
        />
        <IconButton
          icon={pressed.thumbDown ? 'thumb-down' : 'thumb-down-outline'}
          iconColor={pressed.thumbDown ? theme.colors.error : theme.colors.primary}
          size={26}
          onPress={() => handlePress('thumbDown')}
        />

        {/* <IconButton // No borrar, es para ultimas versiones
          icon='download'
          iconColor={theme.colors.primary}
          size={26}
          onPress={() => handlePress('download')}
        /> */}
      </View>
      <Chip textStyle={{ textAlign: 'center', fontWeight: 'bold' }} style={{ backgroundColor: totalLikesAndDislikes < 0 ? theme.colors.errorContainer : theme.colors.secondaryContainer }}>
        Likes: {numbToEng(totalLikesAndDislikes)}
      </Chip>
    </View>
  )
}

export default Reaction
