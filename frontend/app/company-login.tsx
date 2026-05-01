import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GOOGLE_WEB_CLIENT_ID, getApiUrl } from '@/constants/api';
import { savePrivilegedSession } from '@/services/privilegedAuth';

WebBrowser.maybeCompleteAuthSession();
const LOGO = require('./_assets/favicon.png');
const IS_WEB = Platform.OS === 'web';

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

type CompanyUser = { id: number; email: string; username: string; nombre?: string };

export default function CompanyLoginScreen() {
  const router = useRouter();
  const { openGoogle } = useLocalSearchParams<{ openGoogle?: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const openedGoogleRef = useRef(false);

  const discovery = useAutoDiscovery('https://accounts.google.com');
  const redirectUri = makeRedirectUri({ scheme: 'frontend' });
  const [request, response, promptAsync] = useAuthRequest(
    { clientId: GOOGLE_WEB_CLIENT_ID, scopes: ['openid', 'email', 'profile'], redirectUri },
    discovery ?? null
  );

  useEffect(() => {
    if (!IS_WEB) return;
    if (response?.type !== 'success' || !request) return;
    const code = response.params.code;
    const verifier = (request as { codeVerifier?: string }).codeVerifier;
    if (code) loginWithCode(code, redirectUri, verifier);
  }, [response]);

  useEffect(() => {
    if (!IS_WEB) return;
    if (openGoogle === '1' && request && !openedGoogleRef.current) {
      openedGoogleRef.current = true;
      promptAsync();
    }
  }, [openGoogle, request]);

  async function onLoginOk(data: { company: CompanyUser; token: string }) {
    await savePrivilegedSession('company', { token: data.token, user: data.company });
    router.replace('/company-home' as Href);
  }

  async function loginWithIdToken(idToken: string) {
    const res = await fetch(`${getApiUrl()}/auth/company/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesion empresa');
    await onLoginOk(data);
  }

  async function loginWithCode(code: string, redirectUriValue: string, codeVerifier?: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiUrl()}/auth/company/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: redirectUriValue, code_verifier: codeVerifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesion empresa');
      await onLoginOk(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (IS_WEB) {
      promptAsync();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = (userInfo as any).data?.idToken ?? (userInfo as any).idToken;
      if (!idToken) throw new Error('No se pudo obtener el token de Google');
      await loginWithIdToken(idToken);
    } catch (err: any) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err?.code === statusCodes.IN_PROGRESS) setError('Ya hay un inicio de sesion en curso');
      else setError(err instanceof Error ? err.message : 'Error al conectar con Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <View style={styles.card}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Acceso Empresa</Text>
        <Text style={styles.subtitle}>Gestion de solicitudes de estaciones</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.googleButton} onPress={handleLogin} disabled={(IS_WEB && !request) || loading}>
          {loading ? <ActivityIndicator color="#3c4043" /> : <Text style={styles.googleButtonText}>Continuar con Google</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/login' as Href)}>
          <Text style={styles.backLinkText}>Volver al login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingVertical: 40 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', elevation: 3 },
  logo: { width: 160, height: 160, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  googleButton: { width: '100%', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  backLink: { marginTop: 20 },
  backLinkText: { fontSize: 14, color: '#6b7280' },
});
