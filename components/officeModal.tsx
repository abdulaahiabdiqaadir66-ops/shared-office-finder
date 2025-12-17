import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Office } from '../types/types';

interface OfficeModalProps {
  visible: boolean;
  office: Office | null;
  onClose: () => void;
  onBook: (bookingData: { booking_date: string; start_time: string; end_time: string }) => void;
  loading?: boolean;
}

export const OfficeModal: React.FC<OfficeModalProps> = ({ 
  visible, 
  office, 
  onClose, 
  onBook,
  loading = false 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  React.useEffect(() => {
    const defaultEndTime = new Date(startTime);
    defaultEndTime.setHours(startTime.getHours() + 1);
    setEndTime(defaultEndTime);
  }, [startTime]);

  if (!office) return null;

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const handleBook = () => {
    const bookingData = {
      booking_date: formatDate(selectedDate),
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
    };

    if (selectedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    onBook(bookingData);
    setSelectedDate(new Date());
    setStartTime(new Date());
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 1);
    setEndTime(defaultEnd);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const totalCost = (duration * office.price_per_hour).toFixed(2);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle} numberOfLines={2}>{office.title}</Text>
            <Text style={styles.modalLocation}>
              <Ionicons name="location" size={14} color="#1AAB8B" /> {office.location}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333333" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{office.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingContainer}>
              <View style={styles.priceCard}>
                <Ionicons name="time-outline" size={24} color="#1AAB8B" />
                <Text style={styles.price}>${office.price_per_hour}</Text>
                <Text style={styles.priceLabel}>per hour</Text>
              </View>
              <View style={styles.priceCard}>
                <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                <Text style={styles.price}>${office.price_per_day}</Text>
                <Text style={styles.priceLabel}>per day</Text>
              </View>
            </View>
          </View>

          {office.amenities && office.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {office.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Ionicons name="checkmark-circle" size={16} color="#1AAB8B" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.bookingsInfo}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <Text style={styles.bookingsText}>
                {office.booking_count} people have booked this space
              </Text>
            </View>
          </View>

          {/* Booking Form */}
          <View style={styles.bookingSection}>
            <Text style={styles.bookingSectionTitle}>
              <Ionicons name="calendar" size={20} color="#007AFF" /> Book This Space
            </Text>
            
            <View style={styles.dateTimeContainer}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.dateTimeButtonText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeInputWrapper}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.dateTimeButtonText}>{formatTime(startTime)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInputWrapper}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                  <Text style={styles.dateTimeButtonText}>{formatTime(endTime)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bookingSummary}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{duration} hours</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalCost}>${totalCost}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* DateTime Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartTimeChange}
            is24Hour={true}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndTimeChange}
            is24Hour={true}
          />
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={[styles.bookButton, loading && styles.bookButtonDisabled]}
            onPress={handleBook}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>
              {loading ? 'Booking...' : `Book Now - $${totalCost}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 14,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    opacity: 0.8,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.6,
    marginTop: 4,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  bookingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  bookingsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bookingSection: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  bookingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    gap: 10,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  bookingSummary: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.6,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalCost: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});