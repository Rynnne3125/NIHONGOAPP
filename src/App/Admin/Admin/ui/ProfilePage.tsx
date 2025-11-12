import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

// Auto-converted UI from D:\Android\Projects\Nihongo\app\src\main\java\com\example\nihongo\Admin\Admin\ui\ProfilePage.kt
// Manual adjustments required.

export default function ProfilePageScreen(props: any) {
  const [showLogoutDialog, setShowLogoutDialog] = useState('false');

  useEffect(() => {
    // port side-effects here
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
  </View>
  </View>
  <Text>Admin Profile</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  <View style={{ /* container */ }}>
  </View>
  </View>
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
  <Text>Logout</Text>
  <Text>Are you sure you want to logout?</Text>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  </View>
  </View>
  <Text>Logout</Text>
  </View>
  </View>
  <Button title="Action" onPress={() => { /* TODO */ }} />
  <Text>Cancel</Text>
  </View>
  </View>
  </View>
  </View>
  <View style={{ /* container */ }}>
  </View>
  </View>
  </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
