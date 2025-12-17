import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';

export default function Bookings() {
  const { user } = useAuth();
  const { bookings, loading, refetch, cancelBooking } = useBookings(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancelBooking = async (bookingId: string, officeTitle: string) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for ${officeTitle}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await cancelBooking(bookingId);
            if (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            } else {
              Alert.alert('Success', 'Booking cancelled successfully');
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50'; // Success Green
      case 'pending': return '#FF9500';
      case 'cancelled': return '#F44336'; // Error Red
      case 'completed': return '#007AFF'; // Corporate Blue
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'information-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E5E5E5" />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading your bookings...' : 'No bookings yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Book your first office space from the Browse tab!
            </Text>
          </View>
        ) : (
          bookings.map(booking => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingTitleContainer}>
                  <Text style={styles.officeTitle} numberOfLines={1}>
                    {booking.office?.title}
                  </Text>
                  <Text style={styles.officeLocation}>
                    <Ionicons name="location" size={14} color="#1AAB8B" /> {booking.office?.location}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(booking.status) }
                ]}>
                  <Ionicons name={getStatusIcon(booking.status)} size={14} color="#FFFFFF" />
                  <Text style={styles.statusText}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={18} color="#1AAB8B" />
                    <Text style={styles.detailText}>{booking.booking_date}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={18} color="#1AAB8B" />
                    <Text style={styles.detailText}>
                      {booking.start_time} - {booking.end_time}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingFooter}>
                <Text style={styles.bookingDate}>
                  Booked {new Date(booking.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>

                {booking.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking.id, booking.office?.title || 'this office')}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
    marginTop: 4,
  },
  bookingsList: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  officeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  officeLocation: {
    fontSize: 14,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookingDate: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.5,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F5',
    borderRadius: 6,
    gap: 4,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
});