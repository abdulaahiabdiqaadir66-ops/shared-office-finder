import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useOwnerBookings } from '../../hooks/useOwnerBookings';
import { OwnerBooking } from '../../types/types';

export default function OwnerBookings() {
  const { user } = useAuth();
  const { bookings, loading, refetch, updateBookingStatus } = useOwnerBookings(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#007AFF';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'calendar';
      default: return 'help-circle';
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await updateBookingStatus(bookingId, newStatus as any);
    
    if (error) {
      Alert.alert('Error', 'Failed to update booking status');
    } else {
      Alert.alert('Success', `Booking status updated to ${newStatus}`);
      setStatusModalVisible(false);
      setSelectedBooking(null);
    }
  };

  const openStatusModal = (booking: OwnerBooking) => {
    setSelectedBooking(booking);
    setStatusModalVisible(true);
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  const calculateTotal = (booking: OwnerBooking) => {
    if (!booking.office) return '0.00';
    const duration = formatDuration(booking.start_time, booking.end_time).split(' ')[0];
    return (parseFloat(duration) * booking.office.price_per_hour).toFixed(2);
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const getFilterCount = (status: string) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bookings</Text>
          <Text style={styles.subtitle}>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} across your offices
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'all' && styles.filterTabTextActive]}>
            All ({getFilterCount('all')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'pending' && styles.filterTabActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#FF9800' }]} />
          <Text style={[styles.filterTabText, filterStatus === 'pending' && styles.filterTabTextActive]}>
            Pending ({getFilterCount('pending')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'confirmed' && styles.filterTabActive]}
          onPress={() => setFilterStatus('confirmed')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.filterTabText, filterStatus === 'confirmed' && styles.filterTabTextActive]}>
            Confirmed ({getFilterCount('confirmed')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'completed' && styles.filterTabActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#007AFF' }]} />
          <Text style={[styles.filterTabText, filterStatus === 'completed' && styles.filterTabTextActive]}>
            Completed ({getFilterCount('completed')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'cancelled' && styles.filterTabActive]}
          onPress={() => setFilterStatus('cancelled')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#F44336' }]} />
          <Text style={[styles.filterTabText, filterStatus === 'cancelled' && styles.filterTabTextActive]}>
            Cancelled ({getFilterCount('cancelled')})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E5E5E5" />
            <Text style={styles.emptyStateTitle}>
              {loading ? 'Loading...' : 'No Bookings Found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {filterStatus === 'all'
                ? 'Bookings will appear here when users book your office spaces'
                : `No ${filterStatus} bookings at the moment`
              }
            </Text>
          </View>
        ) : (
          filteredBookings.map(booking => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.officeInfo}>
                  <Text style={styles.officeTitle} numberOfLines={1}>
                    {booking.office?.title || 'Office Not Found'}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#333333" />
                    <Text style={styles.officeLocation} numberOfLines={1}>
                      {booking.office?.location || 'Unknown'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}
                  onPress={() => openStatusModal(booking)}
                >
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(booking.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.userCard}>
                <Ionicons name="person-circle-outline" size={20} color="#007AFF" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{booking.user?.full_name || 'Unknown User'}</Text>
                  <Text style={styles.userEmail}>{booking.user?.email}</Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#007AFF" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {booking.booking_date} • {booking.start_time} - {booking.end_time}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="time-outline" size={18} color="#1AAB8B" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {formatDuration(booking.start_time, booking.end_time)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="cash-outline" size={18} color="#4CAF50" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Total Amount</Text>
                    <Text style={styles.detailValueHighlight}>
                      ${calculateTotal(booking)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingFooter}>
                <Text style={styles.bookingDate}>
                  Booked: {new Date(booking.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <TouchableOpacity 
                  style={styles.changeStatusButton}
                  onPress={() => openStatusModal(booking)}
                >
                  <Text style={styles.changeStatusText}>Update Status</Text>
                  <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Booking Status</Text>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setStatusModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            
            {selectedBooking && (
              <>
                <View style={styles.modalBookingInfo}>
                  <Text style={styles.modalOfficeTitle}>
                    {selectedBooking.office?.title || 'Office Not Found'}
                  </Text>
                  <Text style={styles.modalUserName}>
                    {selectedBooking.user?.full_name || 'Unknown User'}
                  </Text>
                </View>
                
                <View style={styles.currentStatusContainer}>
                  <Text style={styles.currentStatusLabel}>Current Status:</Text>
                  <View style={[
                    styles.currentStatusBadge,
                    { backgroundColor: getStatusColor(selectedBooking.status) + '15' }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(selectedBooking.status) as any} 
                      size={18} 
                      color={getStatusColor(selectedBooking.status)} 
                    />
                    <Text style={[styles.currentStatusText, { color: getStatusColor(selectedBooking.status) }]}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.selectStatusLabel}>Select new status:</Text>
                <View style={styles.statusOptions}>
                  {getStatusOptions(selectedBooking.status).map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.statusOption, { borderColor: getStatusColor(status) }]}
                      onPress={() => handleStatusUpdate(selectedBooking.id, status)}
                    >
                      <Ionicons 
                        name={getStatusIcon(status) as any} 
                        size={24} 
                        color={getStatusColor(status)} 
                      />
                      <Text style={[styles.statusOptionText, { color: getStatusColor(status) }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#333333',
    opacity: 0.6,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFB',
    marginRight: 8,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  bookingsList: {
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
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  officeInfo: {
    flex: 1,
    marginRight: 12,
  },
  officeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  officeLocation: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.6,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.6,
  },
  bookingDetails: {
    gap: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#333333',
    opacity: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  detailValueHighlight: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
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
    fontSize: 12,
    color: '#333333',
    opacity: 0.6,
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeStatusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalClose: {
    padding: 4,
  },
  modalBookingInfo: {
    backgroundColor: '#F8FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalOfficeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  modalUserName: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.7,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  currentStatusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectStatusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  statusOptions: {
    gap: 12,
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F8FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});