import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn, signUp, user } = useAuth();
  const params = useLocalSearchParams();
  const defaultUserType = params.type as string || 'user';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'owner' | 'user'>(defaultUserType as 'owner' | 'user');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      setLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      const { error } = await signUp(email, password, userType);
      setLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Account created successfully!');
      }
    }
  };

  React.useEffect(() => {
    if (user) {
      if (user.user_type === 'owner') {
        router.replace('/(owner)/dashboard');
      } else {
        router.replace('/(user)/dashboard');
      }
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Join OfficeFinder Pro today'}
        </Text>
      </View>

      {!isLogin && (
        <View style={styles.userTypeContainer}>
          <Text style={styles.userTypeLabel}>I am a:</Text>
          <View style={styles.userTypeButtons}>
            <TouchableOpacity 
              style={[
                styles.userTypeButton, 
                userType === 'user' && styles.userTypeButtonActiveUser
              ]}
              onPress={() => setUserType('user')}
            >
              <Text style={[
                styles.userTypeButtonText,
                userType === 'user' && styles.userTypeButtonTextActive
              ]}>
                Space Seeker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.userTypeButton, 
                userType === 'owner' && styles.userTypeButtonActiveOwner
              ]}
              onPress={() => setUserType('owner')}
            >
              <Text style={[
                styles.userTypeButtonText,
                userType === 'owner' && styles.userTypeButtonTextActive
              ]}>
                Space Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.linkText}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
        
        {isLogin && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.quickAccess}>
              <Text style={styles.quickAccessText}>Quick Access</Text>
              <View style={styles.quickAccessButtons}>
                <TouchableOpacity 
                  style={[
                    styles.quickButton,
                    userType === 'user' && styles.quickButtonActiveUser
                  ]}
                  onPress={() => {
                    setUserType('user');
                    router.push('/login?type=user');
                  }}
                >
                  <Text style={[
                    styles.quickButtonText,
                    userType === 'user' && styles.quickButtonTextActive
                  ]}>
                    User Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.quickButton,
                    userType === 'owner' && styles.quickButtonActiveOwner
                  ]}
                  onPress={() => {
                    setUserType('owner');
                    router.push('/login?type=owner');
                  }}
                >
                  <Text style={[
                    styles.quickButtonText,
                    userType === 'owner' && styles.quickButtonTextActive
                  ]}>
                    Owner Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    opacity: 0.6,
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  userTypeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  userTypeButtonActiveUser: {
    backgroundColor: '#1AAB8B',
    borderColor: '#1AAB8B',
  },
  userTypeButtonActiveOwner: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  userTypeButtonText: {
    color: '#333333',
    fontWeight: '600',
    fontSize: 15,
  },
  userTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  linksContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  quickAccess: {
    alignItems: 'center',
    width: '100%',
  },
  quickAccessText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  quickButton: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  quickButtonActiveUser: {
    backgroundColor: '#1AAB8B',
    borderColor: '#1AAB8B',
  },
  quickButtonActiveOwner: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  quickButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  quickButtonTextActive: {
    color: '#FFFFFF',
  },
});