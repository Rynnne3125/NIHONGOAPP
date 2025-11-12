import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

// Auto-converted UI from D:\Android\Projects\Nihongo\app\src\main\java\com\example\nihongo\Admin\Admin\AdminLoginScreen.kt
// Manual adjustments required.

export default function AdminLoginScreen(props: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState('false');

  useEffect(() => {
    // port side-effects here
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
  <View style={{ /* container */ }}>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  </View>
  <Text>Email Admin</Text>
  <TextInput style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }} />
  <Text>Mật khẩu</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />

  <Text>Đăng nhập</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
