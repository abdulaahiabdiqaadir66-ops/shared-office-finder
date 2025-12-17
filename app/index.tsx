import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    if (user.user_type === 'owner') {
      return <Redirect href="/(owner)/dashboard" />;
    } else {
      return <Redirect href="/(user)/dashboard" />;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Office Finder</Text>
      <Text style={styles.subtitle}>Find or Share Workspace Solutions</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.ownerButton]}
          onPress={() => router.push('/login?type=owner')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>I'm an Owner</Text>
          <Text style={styles.buttonSubtext}>List and manage office spaces</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.userButton]}
          onPress={() => router.push('/user-signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>I Need a Space</Text>
          <Text style={styles.buttonSubtext}>Find and book offices</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => router.push('/login')}
          activeOpacity={0.6}
        >
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF', // Bright White background
  },
  loadingText: {
    fontSize: 18,
    color: '#333333', // Dark Gray for readable text
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333', // Dark Gray text
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333333', // Use Dark Gray for better contrast than previous gray shade
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  ownerButton: {
    backgroundColor: '#007AFF', // Corporate Blue primary
  },
  userButton: {
    backgroundColor: '#1AAB8B', // Warm Teal accent (changed from green to palette warm teal)
  },
  buttonText: {
    color: '#FFFFFF', // White text on buttons
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF', // White subtext
    fontSize: 14,
    opacity: 0.9,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  loginLinkText: {
    color: '#007AFF', // Corporate Blue for link
    fontSize: 16,
    fontWeight: '600',
  },
});
