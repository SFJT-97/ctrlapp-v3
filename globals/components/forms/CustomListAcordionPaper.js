import { useEffect, useState } from 'react'
import { Divider, List } from 'react-native-paper'
import { Controller } from 'react-hook-form'

/* data = {
    id
    description
    value
    customDescription
    secondValue
  }
*/

const CustomPaperListAcordion = ({
  control,
  name,
  title = 'untitled',
  expand = false,
  icon = 'folder',
  data = null // deberá tener esta estructura. [id, main description (title), value, second description (customDescription), second value ]
}) => {
  const [expanded, setExpanded] = useState(expand)

  const handlePress = () => {
    setExpanded(!expanded)
  }
  const [selected, setSelected] = useState(false)
  const [newDescription, setNewDescription] = useState(data ? data.id : 'no description')
  const [newTitle, setNewTitle] = useState(data ? data.description : 'No Title')
  const [newIcon, setNewIcon] = useState(icon)
  const [newValue, setNewValue] = useState(data)
  useEffect(() => {
    setNewDescription(newDescription)
    setNewTitle(newTitle)
    setNewIcon(newIcon)
    setNewValue(newValue)
  }, [selected])
  const ItemsList = () => {
    const result = data.map(el =>
      <List.Item
        key={el.id}
        title={el.description}
        descriptionNumberOfLines={3}
        descriptionEllipsizeMode='middle'
        descriptionStyle={{ alignContent: 'center', fontWeight: '300' }}
        description={`id=${el.id}|${el.value}|${el.customDescription}|${el.secondValue}`}
        titleStyle={{ color: 'orange' }}
        onPress={() => {
          setNewTitle(el.description)
          setNewIcon('check')
          setNewDescription(el.id)
          setNewValue(el)
          setSelected(!selected)
          setExpanded(!expanded)
        }}
      />)
    return (
      <>
        {result}
      </>

    )
  }
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <>
          <Divider />
          <List.Section title={title} titleStyle={{ paddingBottom: 1 }}>
            <List.Accordion
              titleStyle={{ color: 'darkgreen', alignSelf: 'center' }}
              descriptionStyle={{ color: 'darkgreen' }}
              title={newTitle}
              left={props => <List.Icon {...props} icon={newIcon} />}
              expanded={expanded}
              onPress={handlePress}
              description={newDescription}
              value={newValue}
            >
              {
                data && <ItemsList />
              }
            </List.Accordion>
          </List.Section>
          <Divider />
        </>
      )}
    />
  )
}

export default CustomPaperListAcordion
