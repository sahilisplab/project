import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { loginUser, registerUser } from '../config/firebase';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email.trim(), password, username.trim());
      } else {
        await loginUser(email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={isRegister ? 'Create Crafter Account' : 'Welcome Back, Crafter'}
          subtitle="Minecraft Companion & Crafting Guide"
        />
        <Card.Content>
          {isRegister && (
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
            />
          )}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
            buttonColor="#2E7D32">
            {isRegister ? 'Register' : 'Login'}
          </Button>
          <Button
            mode="text"
            onPress={() => setIsRegister(!isRegister)}
            style={styles.switchBtn}>
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#1E1E1E' },
  card: { padding: 8 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, paddingVertical: 4 },
  switchBtn: { marginTop: 12 },
});
