import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Dialog, Divider, IconButton, List, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

// Define types for structure
interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'multiline' | 'boolean';
}

interface SimpleItem {
  type: 'simple';
  id: string;
  description: string;
  checked: boolean;
  values: Record<string, any>; // string or boolean
}

interface SubItem {
  type: 'sub';
  id: string;
  description: string;
  checked: boolean;
  checklist: Checklist;
}

type Item = SimpleItem | SubItem;

interface Checklist {
  id: string;
  name: string;
  fields: Field[];
  items: Item[];
}

// Mock initial data
const initialChecklists: Checklist[] = [
  {
    id: '1',
    name: 'Fleet Vehicle Check',
    fields: [
      { id: 'f1', name: 'Notes', type: 'multiline' },
      { id: 'f2', name: 'Mileage', type: 'number' },
      { id: 'f3', name: 'Passed Inspection', type: 'boolean' },
    ],
    items: [
      { type: 'simple', id: '1-1', description: 'Vehicle A', checked: false, values: { f1: '', f2: '', f3: false } },
      { type: 'sub', id: '1-2', description: 'Sub-Check: Brakes', checked: false, checklist: {
        id: 'sub1', name: 'Brakes Inspection', fields: [], items: [
          { type: 'simple', id: 'sub1-1', description: 'Pad Thickness', checked: false, values: {} },
        ]
      }},
    ],
  },
  // Additional mock checklists can be added similarly
];

const ChecklistHome = () => {
  const theme = useTheme();
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selectedChecklist = checklists.find(cl => cl.id === selectedChecklistId);

  const handleCreate = (newChecklist: Checklist) => {
    setChecklists([...checklists, newChecklist]);
    setCreating(false);
  };

  const handleUpdate = (updatedChecklist: Checklist) => {
    setChecklists(checklists.map(cl => cl.id === updatedChecklist.id ? updatedChecklist : cl));
  };

  if (creating) {
    return <CreateChecklist onCreate={handleCreate} onCancel={() => setCreating(false)} />;
  }

  if (selectedChecklist) {
    return <ChecklistDetail checklist={selectedChecklist} onUpdate={handleUpdate} onBack={() => setSelectedChecklistId(null)} />;
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={styles.title}>Checklist Management</Text>
      <Button mode="contained" icon="plus" onPress={() => setCreating(true)} style={styles.actionButton}>Create New Checklist</Button>
      <FlatList
        data={checklists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Fields: ${item.fields.length} | Items: ${item.items.length}`}
            onPress={() => setSelectedChecklistId(item.id)}
            left={() => <List.Icon icon="clipboard-check" />}
          />
        )}
        ItemSeparatorComponent={Divider}
      />
    </Surface>
  );
};

// Component for creating a new checklist with custom fields
const CreateChecklist: React.FC<{ onCreate: (checklist: Checklist) => void; onCancel: () => void }> = ({ onCreate, onCancel }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [addFieldVisible, setAddFieldVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'multiline' | 'boolean'>('text');

  const addField = () => {
    if (newFieldName.trim()) {
      const newField: Field = { id: Date.now().toString(), name: newFieldName, type: newFieldType };
      setFields([...fields, newField]);
      setNewFieldName('');
      setNewFieldType('text');
      setAddFieldVisible(false);
    }
  };

  const createChecklist = () => {
    if (name.trim()) {
      const newChecklist: Checklist = {
        id: Date.now().toString(),
        name,
        fields,
        items: [],
      };
      onCreate(newChecklist);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={styles.title}>Create New Checklist</Text>
      <TextInput label="Checklist Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <Text variant="titleMedium" style={styles.sectionTitle}>Custom Fields (Optional)</Text>
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <List.Item title={item.name} description={`Type: ${item.type}`} />}
        ItemSeparatorComponent={Divider}
      />
      <Button mode="outlined" icon="plus" onPress={() => setAddFieldVisible(true)} style={styles.actionButton}>Add Custom Field</Button>
      <View style={styles.buttonGroup}>
        <Button mode="contained" onPress={createChecklist} style={styles.actionButton}>Create</Button>
        <Button mode="outlined" onPress={onCancel} style={styles.actionButton}>Cancel</Button>
      </View>
      <Portal>
        <Dialog visible={addFieldVisible} onDismiss={() => setAddFieldVisible(false)}>
          <Dialog.Title>Add Custom Field</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Field Name" value={newFieldName} onChangeText={setNewFieldName} mode="outlined" />
            <Picker selectedValue={newFieldType} onValueChange={setNewFieldType}>
              <Picker.Item label="Text" value="text" />
              <Picker.Item label="Number" value="number" />
              <Picker.Item label="Multiline Note" value="multiline" />
              <Picker.Item label="Boolean" value="boolean" />
            </Picker>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddFieldVisible(false)}>Cancel</Button>
            <Button onPress={addField}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

// Component for viewing and editing a single checklist
const ChecklistDetail: React.FC<{ checklist: Checklist; onUpdate: (updated: Checklist) => void; onBack: () => void }> = ({ checklist, onUpdate, onBack }) => {
  const theme = useTheme();
  const [addingType, setAddingType] = useState<'simple' | 'sub' | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newValues, setNewValues] = useState<Record<string, any>>({});
  const [subCreating, setSubCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const toggleChecked = (itemId: string, currentChecked: boolean) => {
    const updateItems = (items: Item[]): Item[] => items.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !currentChecked };
      }
      if (item.type === 'sub') {
        return { ...item, checklist: { ...item.checklist, items: updateItems(item.checklist.items) } };
      }
      return item;
    });
    onUpdate({ ...checklist, items: updateItems(checklist.items) });
  };

  const startAddSimple = () => {
    setNewValues(checklist.fields.reduce((acc, f) => ({ ...acc, [f.id]: f.type === 'boolean' ? false : '' }), {}));
    setNewDescription('');
    setAddingType('simple');
  };

  const startAddSub = () => {
    setNewDescription('');
    setAddingType('sub');
  };

  const addSimpleItem = () => {
    if (newDescription.trim()) {
      const newItem: SimpleItem = {
        type: 'simple',
        id: Date.now().toString(),
        description: newDescription,
        checked: false,
        values: newValues,
      };
      onUpdate({ ...checklist, items: [...checklist.items, newItem] });
      setAddingType(null);
    }
  };

  const handleSubCreate = (newSubChecklist: Checklist) => {
    if (newDescription.trim()) {
      const newItem: SubItem = {
        type: 'sub',
        id: Date.now().toString(),
        description: newDescription,
        checked: false,
        checklist: newSubChecklist,
      };
      onUpdate({ ...checklist, items: [...checklist.items, newItem] });
      setSubCreating(false);
      setAddingType(null);
    }
  };

  const addSubItem = () => {
    if (newDescription.trim()) {
      setSubCreating(true);
    }
  };

  const updateValue = (itemId: string, fieldId: string, value: any) => {
    const updateItems = (items: Item[]): Item[] => items.map(item => {
      if (item.type === 'simple' && item.id === itemId) {
        return { ...item, values: { ...item.values, [fieldId]: value } };
      }
      if (item.type === 'sub') {
        return { ...item, checklist: { ...item.checklist, items: updateItems(item.checklist.items) } };
      }
      return item;
    });
    onUpdate({ ...checklist, items: updateItems(checklist.items) });
  };

  const editItem = (item: Item) => {
    setNewDescription(item.description);
    setNewValues(item.type === 'simple' ? { ...item.values } : {});
    setEditingItem(item);
  };

  const saveEdit = () => {
    if (editingItem && newDescription.trim()) {
      const updateItems = (items: Item[]): Item[] => items.map(item => {
        if (item.id === editingItem.id) {
          const updatedItem = { ...item, description: newDescription };
          if (editingItem.type === 'simple') {
            (updatedItem as SimpleItem).values = newValues;
          }
          return updatedItem;
        }
        if (item.type === 'sub') {
          return { ...item, checklist: { ...item.checklist, items: updateItems(item.checklist.items) } };
        }
        return item;
      });
      onUpdate({ ...checklist, items: updateItems(checklist.items) });
      setEditingItem(null);
    }
  };

  if (subCreating) {
    return <CreateChecklist onCreate={handleSubCreate} onCancel={() => setSubCreating(false)} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button icon="arrow-left" onPress={onBack} style={styles.backButton}>Back</Button>
      <Text variant="headlineLarge" style={styles.title}>{checklist.name}</Text>
      <ChecklistView
        checklist={checklist}
        onToggleChecked={toggleChecked}
        onUpdateValue={updateValue}
        onEditItem={editItem}
      />
      <View style={styles.buttonGroup}>
        <Button mode="contained" icon="plus" onPress={startAddSimple} style={styles.actionButton}>Add Simple Item</Button>
        <Button mode="contained" icon="plus" onPress={startAddSub} style={styles.actionButton}>Add Sub-Checklist</Button>
      </View>
      <Portal>
        <Dialog visible={addingType === 'simple'} onDismiss={() => setAddingType(null)}>
          <Dialog.Title>Add Simple Item</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Description" value={newDescription} onChangeText={setNewDescription} mode="outlined" />
            {checklist.fields.map(field => (
              field.type === 'boolean' ? (
                <View key={field.id} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{field.name}</Text>
                  <Checkbox
                    status={newValues[field.id] ? 'checked' : 'unchecked'}
                    onPress={() => setNewValues({ ...newValues, [field.id]: !newValues[field.id] })}
                  />
                </View>
              ) : (
                <TextInput
                  key={field.id}
                  label={field.name}
                  value={newValues[field.id]}
                  onChangeText={v => setNewValues({ ...newValues, [field.id]: v })}
                  mode="outlined"
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  multiline={field.type === 'multiline'}
                  numberOfLines={field.type === 'multiline' ? 4 : 1}
                />
              )
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddingType(null)}>Cancel</Button>
            <Button onPress={addSimpleItem}>Add</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={addingType === 'sub'} onDismiss={() => setAddingType(null)}>
          <Dialog.Title>Add Sub-Checklist</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Description" value={newDescription} onChangeText={setNewDescription} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddingType(null)}>Cancel</Button>
            <Button onPress={addSubItem}>Proceed to Create Sub</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={!!editingItem} onDismiss={() => setEditingItem(null)}>
          <Dialog.Title>Edit Item</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Description" value={newDescription} onChangeText={setNewDescription} mode="outlined" />
            {editingItem?.type === 'simple' && checklist.fields.map(field => (
              field.type === 'boolean' ? (
                <View key={field.id} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{field.name}</Text>
                  <Checkbox
                    status={newValues[field.id] ? 'checked' : 'unchecked'}
                    onPress={() => setNewValues({ ...newValues, [field.id]: !newValues[field.id] })}
                  />
                </View>
              ) : (
                <TextInput
                  key={field.id}
                  label={field.name}
                  value={newValues[field.id]}
                  onChangeText={v => setNewValues({ ...newValues, [field.id]: v })}
                  mode="outlined"
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  multiline={field.type === 'multiline'}
                  numberOfLines={field.type === 'multiline' ? 4 : 1}
                />
              )
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditingItem(null)}>Cancel</Button>
            <Button onPress={saveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

// Recursive component for rendering checklists and nested items
const ChecklistView: React.FC<{
  checklist: Checklist;
  onToggleChecked: (itemId: string, checked: boolean) => void;
  onUpdateValue: (itemId: string, fieldId: string, value: any) => void;
  onEditItem: (item: Item) => void;
}> = ({ checklist, onToggleChecked, onUpdateValue, onEditItem }) => {
  return (
    <View>
      {checklist.name && <Text variant="titleMedium" style={styles.subTitle}>{checklist.name}</Text>}
      <FlatList
        data={checklist.items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const hasContent = item.type === 'sub' || (item.type === 'simple' && checklist.fields.length > 0);
          const checkbox = (
            <Checkbox
              status={item.checked ? 'checked' : 'unchecked'}
              onPress={() => onToggleChecked(item.id, item.checked)}
            />
          );
          const editButton = (
            <IconButton
              icon="pencil"
              onPress={() => onEditItem(item)}
            />
          );

          if (!hasContent) {
            return (
              <List.Item
                title={item.description}
                left={() => checkbox}
                right={() => editButton}
              />
            );
          }

          return (
            <List.Accordion
              title={item.description}
              left={() => checkbox}
              right={() => editButton}
            >
              {item.type === 'simple' ? (
                <View style={styles.fieldsContainer}>
                  {checklist.fields.map(field => (
                    field.type === 'boolean' ? (
                      <View key={field.id} style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>{field.name}</Text>
                        <Checkbox
                          status={item.values[field.id] ? 'checked' : 'unchecked'}
                          onPress={() => onUpdateValue(item.id, field.id, !item.values[field.id])}
                        />
                      </View>
                    ) : (
                      <TextInput
                        key={field.id}
                        label={field.name}
                        value={item.values[field.id] || ''}
                        onChangeText={v => onUpdateValue(item.id, field.id, v)}
                        mode="outlined"
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        multiline={field.type === 'multiline'}
                        numberOfLines={field.type === 'multiline' ? 4 : 1}
                        style={styles.fieldInput}
                      />
                    )
                  ))}
                </View>
              ) : (
                <ChecklistView
                  checklist={item.checklist}
                  onToggleChecked={onToggleChecked}
                  onUpdateValue={onUpdateValue}
                  onEditItem={onEditItem}
                />
              )}
            </List.Accordion>
          );
        }}
        ItemSeparatorComponent={Divider}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  subTitle: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  actionButton: {
    marginVertical: 8,
  },
  backButton: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  fieldsContainer: {
    padding: 16,
  },
  fieldInput: {
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    flex: 1,
    marginRight: 8,
  },
});

export default ChecklistHome;