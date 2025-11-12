import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

// Auto-converted UI from D:\Android\Projects\Nihongo\app\src\main\java\com\example\nihongo\Admin\Admin\ui\CoursePage.kt
// Manual adjustments required.

export default function CoursePageScreen(props: any) {
  const [isEditing, setIsEditing] = useState('false');
  const [showAddDialog, setShowAddDialog] = useState('false');

  useEffect(() => {
    // port side-effects here
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
