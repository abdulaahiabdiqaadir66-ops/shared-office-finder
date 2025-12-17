import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OfficeCard } from '../../components/officeCard';
import { useAuth } from '../../contexts/AuthContext';
import { useOffices } from '../../hooks/useOffices';

export default function OwnerDashboard() {
  const { user, signOut } = useAuth();
  const { offices, loading, refetch, updateOfficeAvailability, deleteOffice } = useOffices(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'unavailable'>('all');

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleAvailability = async (officeId: string, isAvailable: boolean) => {
    const { error } = await updateOfficeAvailability(officeId, isAvailable);
    if (error) {
      Alert.alert('Error', 'Failed to update office availability');
    }
  };

  const handleDeleteOffice = async (officeId: string) => {
    const { error } = await deleteOffice(officeId);
    if (error) {
      Alert.alert('Error', 'Failed to delete office');
    }
  };

  const availableOffices = offices.filter(office => office.is_available);
  const unavailableOffices = offices.filter(office => !office.is_available);
  const totalBookings = offices.reduce((sum, office) => sum + (office.booking_count || 0), 0);

  const getFilteredOffices = () => {
    switch (activeTab) {
      case 'available':
        return availableOffices;
      case 'unavailable':
        return unavailableOffices;
      default:
        return offices;
    }
  };

  const filteredOffices = getFilteredOffices();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.title}>Your Dashboard</Text>
          </View>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="business" size={24} color="#007AFF" />
            </View>
            <Text style={styles.statNumber}>{offices.length}</Text>
            <Text style={styles.statLabel}>Total Offices</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconSuccess]}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{availableOffices.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconAccent]}>
              <Ionicons name="calendar" size={24} color="#1AAB8B" />
            </View>
            <Text style={styles.statNumber}>{totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({offices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available ({availableOffices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unavailable' && styles.tabActive]}
          onPress={() => setActiveTab('unavailable')}
        >
          <Text style={[styles.tabText, activeTab === 'unavailable' && styles.tabTextActive]}>
            Unavailable ({unavailableOffices.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Office List */}
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={styles.officeList}
        showsVerticalScrollIndicator={false}
      >
        {filteredOffices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color="#E5E5E5" />
            <Text style={styles.emptyStateTitle}>No Offices Found</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'all' 
                ? 'Add your first office to get started'
                : `No ${activeTab} offices at the moment`
              }
            </Text>
          </View>
        ) : (
          filteredOffices.map(office => (
            <OfficeCard
              key={office.id}
              office={office}
              userType="owner"
              onToggleAvailability={handleToggleAvailability}
              onDelete={handleDeleteOffice}
            />
          ))
        )}
      </ScrollView>

      {loading && offices.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your offices...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  signOutButton: {
    padding: 10,
    backgroundColor: '#FEE',
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 0,
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    padding: 3,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconSuccess: {
    backgroundColor: '#E8F5E9',
  },
  statIconAccent: {
    backgroundColor: '#E0F2F1',
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
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  officeList: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#333333',
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 12,
  },
});