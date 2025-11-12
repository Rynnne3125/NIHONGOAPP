import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

// Auto-converted UI from D:\Android\Projects\Nihongo\app\src\main\java\com\example\nihongo\Admin\Admin\ui\NotifyPage.kt
// Manual adjustments required.

export default function NotifyPageScreen(props: any) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isScheduled, setIsScheduled] = useState('false');
  const [isDaily, setIsDaily] = useState('false');
  const [dailyHour, setDailyHour] = useState('9');
  const [dailyMinute, setDailyMinute] = useState('0');
  const [showDatePicker, setShowDatePicker] = useState('false');
  const [showTimePicker, setShowTimePicker] = useState('false');
  const [showDailyTimePicker, setShowDailyTimePicker] = useState('false');
  const [activeTab, setActiveTab] = useState('0');
  const [isEditMode, setIsEditMode] = useState('false');
  const [currentEditCampaignId, setCurrentEditCampaignId] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('url');
  const [selectedDefaultImage, setSelectedDefaultImage] = useState('');
  const [showImagePreview, setShowImagePreview] = useState('false');
  const [isUploading, setIsUploading] = useState('false');
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
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <Text>Title</Text>
  </View>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <Text>Message</Text>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  </View>
  <Text>Image URL</Text>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Uploading...</Text>
  </View>
  <Text>Chọn ảnh từ máy</Text>
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
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Text>Send immediately</Text>
  </View>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Text>Schedule for later</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  <Text>Send daily</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
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
  <View style={{ /* container */ }}>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Create Campaign</Text>
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
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
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
  <View style={{ /* container */ }}>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <View style={{ /* container */ }}>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <View style={{ /* container */ }}>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
