import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

// Auto-converted UI from D:\Android\Projects\Nihongo\app\src\main\java\com\example\nihongo\Admin\Admin\ui\LessonPage.kt
// Manual adjustments required.

export default function LessonPageScreen(props: any) {
  const [showHelloB, setShowHelloB] = useState('false');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedSubLessonId, setSelectedSubLessonId] = useState('');
  const [showLessonDialog, setShowLessonDialog] = useState('false');
  const [showUnitDialog, setShowUnitDialog] = useState('false');
  const [showSubLessonDialog, setShowSubLessonDialog] = useState('false');
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState('false');
  const [currentLessonId, setCurrentLessonId] = useState('');
  const [currentUnitIndex, setCurrentUnitIndex] = useState('-1');
  const [currentSubLessonIndex, setCurrentSubLessonIndex] = useState('-1');
  const [isEditMode, setIsEditMode] = useState('false');
  const [tempLessonTitle, setTempLessonTitle] = useState('');
  const [tempLessonOverview, setTempLessonOverview] = useState('');
  const [tempLessonStep, setTempLessonStep] = useState('1');
  const [tempUnitTitle, setTempUnitTitle] = useState('');
  const [tempSubLessonTitle, setTempSubLessonTitle] = useState('');
  const [tempSubLessonType, setTempSubLessonType] = useState('');
  const [expanded, setExpanded] = useState('false');

  useEffect(() => {
    // port side-effects here
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <Text>Course Details</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  </View>
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Add Unit</Text>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  </View>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <Text>New Lesson...</Text>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <Text>Lesson overview...</Text>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Text>Save</Text>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Save</Text>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  </View>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Save</Text>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <Text>Delete $itemType</Text>
  </View>
  <Text>Are you sure you want to delete this $itemType? This action cannot be undone.</Text>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Delete</Text>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
  </View>
  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
