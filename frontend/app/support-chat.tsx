import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
// Importamos lo nuevo
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fetchGroqResponse } from '../services/groqService';

const ASSISTANT_AVATAR = require('../assets/images/avatar_asistente_IA.png');

function ChatContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); //Aquí se detectan los botones del mobil para subir o no la pantalla
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const aiResponse = await fetchGroqResponse(newMessages);
    setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backAction}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#10b981" />
            <Text style={styles.headerTitle}>Salir</Text>
          </TouchableOpacity>
          <Text style={styles.headerSubtitle}>Soporte e-Go (Assistente Virtual)</Text>
          <Image source={ASSISTANT_AVATAR} style={styles.headerImage} />
        </View>

        {/* Marco de conversación */}
        <View style={styles.chatFrame}>
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={item.role === 'user' ? styles.userText : styles.aiText}>{item.content}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="chat-bubble-outline" size={50} color="#cbd5e1" />
                <Text style={styles.emptyText}>Hola, soy Voltix, tu asistente virtual de e-Go. ¿En qué puedo ayudarte hoy?</Text>
              </View>
            }
          />
        </View>

        {/* Barra para escribir el mesnaje y enviar */}
        {/* El input usa insets.bottom para no ser tapado por los botones del móvil */}
        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribe aquí..."
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendButton, !input.trim() && styles.disabledBtn]}
              disabled={loading || !input.trim()}
            >
              <MaterialIcons name={loading ? "autorenew" : "send"} size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

//Exportación necesaria para usar el Provider
export default function SupportChatScreen() {
  return (
    <SafeAreaProvider>
      <ChatContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  backAction: { flexDirection: 'row', alignItems: 'center' },
  headerImage: { width: 55, height: 55, borderRadius: 100, marginHorizontal: 10, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 16, color: '#10b981', fontWeight: '600' },
  headerSubtitle: { fontSize: 14, color: '#64748b', fontWeight: 'bold' },

  chatFrame: {
    flex: 1,
    margin: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden'
  },
  listContent: { padding: 15 },
  bubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#10b981', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  userText: { color: 'white' },
  aiText: { color: '#1e293b' },

  inputWrapper: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#fff' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5
  },
  input: { flex: 1, maxHeight: 100, paddingVertical: 8, color: '#1e293b' },
  sendButton: { backgroundColor: '#10b981', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  disabledBtn: { backgroundColor: '#cbd5e1' },
  emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
  emptyText: { textAlign: 'center', marginTop: 10, paddingHorizontal: 40 }
});