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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
