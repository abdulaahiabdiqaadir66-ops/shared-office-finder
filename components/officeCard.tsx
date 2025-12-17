import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Office } from '../types/types';

interface OfficeCardProps {
  office: Office;
  userType: 'owner' | 'user';
  onPress?: () => void;
  onToggleAvailability?: (officeId: string, isAvailable: boolean) => void;
  onDelete?: (officeId: string) => void;
}

export const OfficeCard: React.FC<OfficeCardProps> = ({ 
  office, 
  userType,
  onPress,
  onToggleAvailability, 
  onDelete 
}) => {
  const handleToggleAvailability = () => {
    onToggleAvailability?.(office.id, !office.is_available);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Office',
      'Are you sure you want to delete this office?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete?.(office.id)
        },
      ]
    );
  };

  // User Card View
  if (userType === 'user') {
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{office.title}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#333333" />
              <Text style={styles.location} numberOfLines={1}>{office.location}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, styles.availableBadge]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {office.description}
        </Text>
        
        <View style={styles.priceSection}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Hourly</Text>
            <Text style={styles.priceValue}>${office.price_per_hour}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Daily</Text>
            <Text style={styles.priceValue}>${office.price_per_day}</Text>
          </View>
        </View>

        {office.amenities && office.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {office.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {office.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{office.amenities.length - 3} more</Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.bookingInfo}>
            <Ionicons name="calendar-outline" size={16} color="#1AAB8B" />
            <Text style={styles.bookingCount}>{office.booking_count} bookings</Text>
          </View>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Owner Card View
  return (
    <View style={[styles.card, !office.is_available && styles.cardUnavailable]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{office.title}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#333333" />
            <Text style={styles.location} numberOfLines={1}>{office.location}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge, 
          office.is_available ? styles.availableBadge : styles.unavailableBadge
        ]}>
          <View style={[
            styles.statusDot,
            !office.is_available && styles.statusDotInactive
          ]} />
          <Text style={[
            styles.statusText,
            !office.is_available && styles.statusTextInactive
          ]}>
            {office.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{office.description}</Text>
      
      <View style={styles.priceSection}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Hourly</Text>
          <Text style={styles.priceValue}>${office.price_per_hour}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Daily</Text>
          <Text style={styles.priceValue}>${office.price_per_day}</Text>
        </View>
      </View>

      {office.amenities && office.amenities.length > 0 && (
        <View style={styles.amenitiesContainer}>
          {office.amenities.slice(0, 4).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {office.amenities.length > 4 && (
            <Text style={styles.moreAmenities}>+{office.amenities.length - 4}</Text>
          )}
        </View>
      )}

      <View style={styles.bookingInfoOwner}>
        <Ionicons name="calendar-outline" size={16} color="#1AAB8B" />
        <Text style={styles.bookingCount}>{office.booking_count} total bookings</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            office.is_available ? styles.makeUnavailableButton : styles.makeAvailableButton
          ]}
          onPress={handleToggleAvailability}
        >
          <Ionicons 
            name={office.is_available ? "close-circle-outline" : "checkmark-circle-outline"} 
            size={18} 
            color="#FFFFFF" 
          />
          <Text style={styles.toggleButtonText}>
            {office.is_available ? 'Mark Unavailable' : 'Mark Available'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardUnavailable: {
    opacity: 0.7,
    backgroundColor: '#F9F9F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
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
  availableBadge: {
    backgroundColor: '#E8F5F1',
  },
  unavailableBadge: {
    backgroundColor: '#FEE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  statusDotInactive: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1AAB8B',
  },
  statusTextInactive: {
    color: '#F44336',
  },
  description: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#333333',
    opacity: 0.6,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: '#F0F9F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1AAB8B',
  },
  amenityText: {
    fontSize: 12,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingCount: {
    fontSize: 13,
    color: '#1AAB8B',
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  bookingInfoOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  makeAvailableButton: {
    backgroundColor: '#4CAF50',
  },
  makeUnavailableButton: {
    backgroundColor: '#FF9800',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});