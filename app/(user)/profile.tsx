import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';

export default function Profile() {
  const { user, updateProfile, refreshUser, signOut } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings(user?.id);
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setLoading(true);

    const { error } = await updateProfile({
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      email: user?.email || '',
    });
    setEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            const { error } = await signOut();
            setSigningOut(false);
            
            if (error) {
              Alert.alert('Error', 'Failed to sign out: ' + error.message);
            } else {
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const getMemberSince = () => {
    if (!user?.created_at) return 'Recently';
    
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const confirmedBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  ).length;

  const completedBookings = bookings.filter(booking => 
    booking.status === 'completed'
  ).length;

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.userTypeBadge,
            user.user_type === 'owner' ? styles.ownerBadge : styles.userBadge
          ]}>
            <Ionicons 
              name={user.user_type === 'owner' ? 'business' : 'person'} 
              size={12} 
              color="#FFFFFF" 
            />
            <Text style={styles.badgeText}>
              {user.user_type === 'owner' ? 'Owner' : 'User'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {user.full_name || 'Update Your Name'}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.memberInfo}>
          <Ionicons name="time-outline" size={14} color="#1AAB8B" />
          <Text style={styles.memberSince}>Member since {getMemberSince()}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </View>
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, styles.statIconActive]}>
            <Ionicons name="checkmark-circle" size={20} color="#1AAB8B" />
          </View>
          <Text style={styles.statNumber}>{confirmedBookings}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, styles.statIconCompleted]}>
            <Ionicons name="trophy" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>{completedBookings}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!editing ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            {editing ? (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            ) : (
              <Text style={styles.displayText}>
                {user.full_name || 'Not set'}
              </Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.displayContainer}>
              <Ionicons name="mail-outline" size={18} color="#999" style={styles.displayIcon} />
              <Text style={styles.displayText}>{user.email}</Text>
            </View>
            <Text style={styles.helpText}>Email cannot be changed</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            {editing ? (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <Text style={styles.displayText}>
                {user.phone_number || 'Not set'}
              </Text>
            )}
          </View>

          {/* Account Created */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Created</Text>
            <Text style={styles.displayText}>
              {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {bookingsLoading ? (
          <View style={styles.loadingActivity}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingActivityText}>Loading activity...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Ionicons name="calendar-outline" size={48} color="#E5E5E5" />
            <Text style={styles.emptyActivityText}>No bookings yet</Text>
            <Text style={styles.emptyActivitySubtext}>
              Your booking history will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.recentBookings}>
            {bookings.slice(0, 3).map(booking => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingOffice} numberOfLines={1}>
                    {booking.office?.title}
                  </Text>
                  <View style={styles.bookingDetails}>
                    <Ionicons name="calendar-outline" size={12} color="#999" />
                    <Text style={styles.bookingDate}>
                      {booking.booking_date}
                    </Text>
                    <Ionicons name="time-outline" size={12} color="#999" />
                    <Text style={styles.bookingDate}>
                      {booking.start_time}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  booking.status === 'confirmed' && styles.confirmedBadge,
                  booking.status === 'pending' && styles.pendingBadge,
                  booking.status === 'completed' && styles.completedBadge,
                  booking.status === 'cancelled' && styles.cancelledBadge,
                ]}>
                  <Text style={styles.statusText}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
            {bookings.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {bookings.length} bookings
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Account Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color="#F44336" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
          )}
          <Text style={styles.signOutButtonText}>
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>OfficeFinder Pro v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ownerBadge: {
    backgroundColor: '#007AFF',
  },
  userBadge: {
    backgroundColor: '#1AAB8B',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#333333',
    opacity: 0.6,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberSince: {
    fontSize: 13,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIconActive: {
    // Additional styling if needed
  },
  statIconCompleted: {
    // Additional styling if needed
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#333333',
    opacity: 0.6,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F7FF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333333',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  displayIcon: {
    // Icon styling
  },
  displayText: {
    fontSize: 15,
    color: '#333333',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activitySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  loadingActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingActivityText: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
    marginTop: 4,
  },
  recentBookings: {
    gap: 12,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookingOffice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingDate: {
    fontSize: 13,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmedBadge: {
    backgroundColor: '#E8F5F1',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
  },
  cancelledBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F44336',
    gap: 8,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});