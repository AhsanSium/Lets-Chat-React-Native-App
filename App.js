// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback } from 'react';
import { Button, StyleSheet, Text, TextInput, View, LogBox, Image } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firebase-firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat';


const firebaseConfig = {
  apiKey: "AIzaSyC042wLwTpJ3Bbth_Np9HnNS5ph9EQrKXg",
  authDomain: "lets-chat-ahsan.firebaseapp.com",
  projectId: "lets-chat-ahsan",
  storageBucket: "lets-chat-ahsan.appspot.com",
  messagingSenderId: "774500849425",
  appId: "1:774500849425:web:9353ff0dab468dd630deb0"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// LogBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore();
const chatsRef = db.collection('chats');

export default function App() {

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data()
          return { ...message, createdAt: message.createdAt.toDate() }
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      appendMessages(messagesFirestore);
    })

    return () => unsubscribe();

  }, [])

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])


  async function readUser() {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user))
    }

  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  if (!user) {
    return <View style={styles.container}>
      <Image style={{width: 300, height: 300}}
        source={require('./assets/logo.png')} resizeMode={'cover'}/>
      <TextInput style={styles.input} placeholder='Enter your username' onChangeText={setName} value={name} ></TextInput>
      <Button title="Enter The Chat" onPress={handlePress}></Button>
    </View>
  }


  return (
    
    <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    width: 250,
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'grey'
  },
});

