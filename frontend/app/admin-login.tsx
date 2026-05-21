// Login admin con Google; devuelve JWT para backoffice
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import { getApiUrl, GOOGLE_WEB_CLIENT_ID } from '@/constants/api';
import { getSemanticColors, type SemanticColors } from '@/constants/accessibilityColors';
import { useColorblindPreference } from '@/contexts/ColorblindPreferenceContext';
import { savePrivilegedSession } from '@/services/privilegedAuth';
import SvgComponent from './_assets/logo.jsx'

WebBrowser.maybeCompleteAuthSession();

const IS_WEB = Platform.OS === 'web';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

type AdminUser = {
  id: number;
  email: string;
  username: string;
  admin_since?: string;
};

export default function AdminLoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorblindFriendly } = useColorblindPreference();
  const sem = useMemo(() => getSemanticColors(colorblindFriendly), [colorblindFriendly]);
  const styles = useMemo(() => createAdminLoginStyles(sem), [sem]);
  const { openGoogle } = useLocalSearchParams<{ openGoogle?: string }>();
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const openedGoogleRef = useRef(false);

  const discovery = useAutoDiscovery('https://accounts.google.com');
  const redirectUri = makeRedirectUri({ scheme: 'frontend' });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['openid', 'email', 'profile'],
      redirectUri,
    },
    discovery ?? null
  );

  useEffect(() => {
    if (!IS_WEB) return;
    if (response?.type !== 'success' || !request) return;
    const { code } = response.params;
    const verifier = (request as { codeVerifier?: string }).codeVerifier;
    if (!code) return;
    loginAdminWithCode(code, redirectUri, verifier);
  }, [response]);

  useEffect(() => {
    if (!IS_WEB) return;
    if (openGoogle === '1' && request && !openedGoogleRef.current) {
      openedGoogleRef.current = true;
      promptAsync();
    }
  }, [openGoogle, request]);

  async function submitAdminLocalLogin() {
    if (!email.trim() || !password) {
      setError(t('login.errors.emailPasswordRequired'));
      return;
    }
    setLocalLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiUrl()}/auth/admin/local/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = [data.error, data.message].filter(Boolean).join(' — ');
        setError(detail || t('login.errors.localLoginFailed'));
        return;
      }
      if (data.admin && data.token) {
        setAdmin(data.admin);
        await savePrivilegedSession('admin', { token: data.token, user: data.admin });
        router.replace('/admin-home');
      }
    } catch (err) {
      setError(t('adminLogin.serverHint'));
    } finally {
      setLocalLoading(false);
    }
  }

  async function loginAdminWithIdToken(idToken: string) {
    try {
      const res = await fetch(`${getApiUrl()}/auth/admin/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('adminLogin.loginFailed'));
        return;
      }

      if (data.admin && data.token) {
        setAdmin(data.admin);
        await savePrivilegedSession('admin', { token: data.token, user: data.admin });
        router.replace('/admin-home');
      }
    } catch (err) {
      setError(t('adminLogin.serverHint'));
    }
  }

  async function loginAdminWithCode(code: string, redirectUri: string, codeVerifier?: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiUrl()}/auth/admin/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri, code_verifier: codeVerifier }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('adminLogin.loginFailed'));
        return;
      }

      if (data.admin && data.token) {
        setAdmin(data.admin);
        await savePrivilegedSession('admin', { token: data.token, user: data.admin });
        router.replace('/admin-home');
      }
    } catch (err) {
      setError(t('adminLogin.serverHint'));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin() {
    if (IS_WEB) {
      promptAsync();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const legacyUserInfo = userInfo as unknown as { idToken?: string };
      const modernUserInfo = userInfo as unknown as { data?: { idToken?: string } };
      const idToken = legacyUserInfo.idToken ?? modernUserInfo.data?.idToken;

      if (!idToken) {
        setError(t('login.errors.googleToken'));
        return;
      }

      await loginAdminWithIdToken(idToken);
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // Cancelado por el usuario
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError(t('login.errors.inProgress'));
      } else {
        setError(t('login.errors.googleConnect'));
        console.error('[Google Native Error]', err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <View style={styles.card}>
        <SvgComponent width={150} height={125} />
        <Text style={styles.title}>{t('adminLogin.title')}</Text>
        <Text style={styles.subtitle}>{t('adminLogin.subtitle')}</Text>

        {!GOOGLE_WEB_CLIENT_ID ? (
          <Text style={styles.hintText}>{t('adminLogin.googleHint')}</Text>
        ) : null}

        {admin ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>{t('adminLogin.sessionStarted')}</Text>
            <Text style={styles.successText}>{admin.email}</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.secondaryButtonText}>{t('adminLogin.goToApp')}</Text>
            </TouchableOpacity>
          </View>
        ) : openGoogle === '1' && IS_WEB ? (
          <View style={styles.openingGoogle}>
            <ActivityIndicator size="large" color={sem.accent} />
            <Text style={styles.openingGoogleText}>{t('adminLogin.openingGoogle')}</Text>
          </View>
        ) : (
          <>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.localForm}>
              <TextInput
                style={styles.input}
                placeholder={t('common.email')}
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder={t('common.password')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={submitAdminLocalLogin}
                disabled={localLoading || loading}
                activeOpacity={0.85}
              >
                {localLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('login.signIn')}</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.separatorText}>{t('common.or')}</Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleAdminLogin}
              disabled={!GOOGLE_WEB_CLIENT_ID || (IS_WEB && !request) || loading || localLoading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#3c4043" />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>{t('login.continueGoogle')}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/login')}>
          <Text style={styles.backLinkText}>{t('adminLogin.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createAdminLoginStyles = (sem: SemanticColors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  hintText: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  localForm: {
    width: '100%',
    alignSelf: 'stretch',
  },
  input: {
    width: '100%',
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: sem.accent,
    alignItems: 'center',
    marginBottom: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  separatorText: {
    marginVertical: 14,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  openingGoogle: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  openingGoogleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  successBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  successText: {
    fontSize: 14,
    color: '#374151',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
