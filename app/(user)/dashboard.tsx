import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { OfficeCard } from '../../components/officeCard';
import { OfficeModal } from '../../components/officeModal';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useOffices } from '../../hooks/useOffices';
import { Office } from '../../types/types';

export default function UserDashboard() {
  const { user } = useAuth();
  const { offices, loading, refetch } = useOffices();
  const { createBooking } = useBookings(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleBookOffice = async (bookingData: { booking_date: string; start_time: string; end_time: string }) => {
    if (!selectedOffice) return;

    setBookingLoading(true);
    
    const { error } = await createBooking({
      office_id: selectedOffice.id,
      ...bookingData,
    });

    setBookingLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to create booking: ' + error.message);
    } else {
      Alert.alert('Success', 'Booking created successfully!');
      setSelectedOffice(null);
      await refetch();
    }
  };

  const availableOffices = offices
    .filter(office => office.is_available)
    .filter(office => 
      office.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.title}>Find Your Workspace</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Ionicons name="business-outline" size={16} color="#1AAB8B" />
            <Text style={styles.statText}>{availableOffices.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, location, or amenities..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color="#999" 
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

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
        {availableOffices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "business-outline"} 
              size={64} 
              color="#E5E5E5" 
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No Results Found' : 'No Offices Available'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Check back later for new listings'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {availableOffices.length} {availableOffices.length === 1 ? 'office' : 'offices'} available
              </Text>
              {searchQuery && (
                <Text style={styles.searchingFor}>
                  for "{searchQuery}"
                </Text>
              )}
            </View>
            {availableOffices.map(office => (
              <OfficeCard
                key={office.id}
                office={office}
                userType="user"
                onPress={() => setSelectedOffice(office)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <OfficeModal
        visible={!!selectedOffice}
        office={selectedOffice}
        onClose={() => setSelectedOffice(null)}
        onBook={handleBookOffice}
        loading={bookingLoading}
      />

      {loading && offices.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading offices...</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1AAB8B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
  },
  officeList: {
    padding: 20,
    paddingTop: 8,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  searchingFor: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.6,
    marginTop: 2,
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