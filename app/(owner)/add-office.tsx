import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AddOffice() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    pricePerHour: '',
    pricePerDay: '',
  });
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const amenitiesList = [
    'WiFi',
    'Parking',
    'Air Conditioning',
    'Projector',
    'Whiteboard',
    'Printer',
    'Scanner',
    'Coffee/Tea',
    'Kitchen',
    'Meeting Rooms',
    'Phone Booths',
    'Lounge Area',
    'Security',
    'Reception',
    'Cleaning Services'
  ];

  const locations = [
    'Nairobi CBD',
    'Westlands',
    'Kilimani',
    'Karen',
    'Upper Hill',
    'Parklands',
    'Thika Road',
    'Mombasa Road',
    'Ngong Road',
    'Other'
  ];

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleLocationSelect = (location: string) => {
    if (location === 'Other') {
      setFormData(prev => ({ ...prev, location: '' }));
      setCustomLocation('');
    } else {
      setFormData(prev => ({ ...prev, location }));
      setCustomLocation('');
    }
    setShowLocationModal(false);
  };

  const handleAddOffice = async () => {
    const finalLocation = customLocation || formData.location;
    
    if (!formData.title || !finalLocation || !formData.pricePerHour || !formData.pricePerDay) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedAmenities.length === 0) {
      Alert.alert('Error', 'Please select at least one amenity');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('offices')
        .insert({
          owner_id: user?.id,
          title: formData.title,
          location: finalLocation,
          price_per_hour: parseFloat(formData.pricePerHour),
          price_per_day: parseFloat(formData.pricePerDay),
          amenities: selectedAmenities,
          images: [],
          is_available: true,
          booking_count: 0,
        })
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Office added successfully!');

      setFormData({
        title: '',
        location: '',
        pricePerHour: '',
        pricePerDay: '',
      });
      setSelectedAmenities([]);
      setCustomLocation('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const LocationModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Location</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor="#999"
          />
        </View>

        <FlatList
          data={locations}
          keyExtractor={(item) => item}
          style={styles.locationList}
          contentContainerStyle={styles.locationListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.locationItem,
                formData.location === item && styles.locationItemSelected
              ]}
              onPress={() => handleLocationSelect(item)}
            >
              <Ionicons 
                name="location-outline" 
                size={20} 
                color={formData.location === item ? "#007AFF" : "#999"} 
              />
              <Text style={[
                styles.locationText,
                formData.location === item && styles.locationTextSelected
              ]}>
                {item}
              </Text>
              {formData.location === item && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
        />

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AmenitiesModal = () => (
    <Modal
      visible={showAmenitiesModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Amenities</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowAmenitiesModal(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedAmenities.length} selected
          </Text>
        </View>

        <FlatList
          data={amenitiesList}
          keyExtractor={(item) => item}
          style={styles.amenitiesGrid}
          numColumns={2}
          contentContainerStyle={styles.amenitiesGridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.amenityCard,
                selectedAmenities.includes(item) && styles.amenityCardSelected
              ]}
              onPress={() => toggleAmenity(item)}
            >
              <View style={styles.amenityCardContent}>
                <View style={[
                  styles.checkbox,
                  selectedAmenities.includes(item) && styles.checkboxSelected
                ]}>
                  {selectedAmenities.includes(item) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[
                  styles.amenityCardText,
                  selectedAmenities.includes(item) && styles.amenityCardTextSelected
                ]}>
                  {item}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setShowAmenitiesModal(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Office</Text>
        <Text style={styles.subtitle}>Fill in the details to list your office space</Text>
      </View>

      {/* Office Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Office Title</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="briefcase-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Modern Co-working Space"
            placeholderTextColor="#999"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
        </View>
      </View>

      {/* Location - Redesigned */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity 
          style={styles.locationTrigger}
          onPress={() => setShowLocationModal(true)}
        >
          <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
          <View style={styles.locationTextContainer}>
            <Text style={formData.location || customLocation ? styles.triggerText : styles.triggerPlaceholder}>
              {formData.location || customLocation || 'Select a location'}
            </Text>
            {formData.location && (
              <Text style={styles.locationSubtext}>Preset location</Text>
            )}
            {customLocation && (
              <Text style={styles.locationSubtext}>Custom location</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Custom Location Input */}
        {formData.location === '' && !showLocationModal && (
          <View style={styles.customLocationContainer}>
            <Ionicons name="create-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter custom location"
              placeholderTextColor="#999"
              value={customLocation}
              onChangeText={setCustomLocation}
            />
          </View>
        )}
      </View>

      {/* Price Inputs */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pricing</Text>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Per Hour"
                placeholderTextColor="#999"
                value={formData.pricePerHour}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pricePerHour: text }))}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.helpText}>Hourly rate</Text>
          </View>
          <View style={styles.halfWidth}>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Per Day"
                placeholderTextColor="#999"
                value={formData.pricePerDay}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pricePerDay: text }))}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.helpText}>Daily rate</Text>
          </View>
        </View>
      </View>

      {/* Amenities Section */}
      <View style={styles.inputGroup}>
        <View style={styles.amenitiesHeader}>
          <Text style={styles.label}>Amenities</Text>
          <TouchableOpacity onPress={() => setShowAmenitiesModal(true)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Amenities Preview */}
        {selectedAmenities.length > 0 ? (
          <View style={styles.selectedAmenitiesPreview}>
            <View style={styles.amenitiesChips}>
              {selectedAmenities.slice(0, 3).map((amenity) => (
                <View key={amenity} style={styles.amenityChip}>
                  <Text style={styles.amenityChipText}>{amenity}</Text>
                </View>
              ))}
              {selectedAmenities.length > 3 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{selectedAmenities.length - 3} more</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addAmenitiesButton}
            onPress={() => setShowAmenitiesModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addAmenitiesText}>Add amenities</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleAddOffice}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Adding Office...' : 'Add Office'}
        </Text>
        {!loading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
      </TouchableOpacity>

      <LocationModal />
      <AmenitiesModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
  priceInput: {
    paddingLeft: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#333333',
    opacity: 0.6,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  
  // Location Styles
  locationTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationTextContainer: {
    flex: 1,
  },
  triggerText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  triggerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  locationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  customLocationContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  locationList: {
    flex: 1,
  },
  locationListContent: {
    paddingBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  locationTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedCount: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F8FAFB',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  amenitiesGrid: {
    flex: 1,
    paddingHorizontal: 16,
  },
  amenitiesGridContent: {
    paddingVertical: 16,
  },
  amenityCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    minHeight: 80,
  },
  amenityCardSelected: {
    backgroundColor: '#F0F9F7',
    borderColor: '#1AAB8B',
  },
  amenityCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxSelected: {
    backgroundColor: '#1AAB8B',
    borderColor: '#1AAB8B',
  },
  amenityCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  amenityCardTextSelected: {
    color: '#1AAB8B',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Amenities Styles
  amenitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedAmenitiesPreview: {
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  amenitiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#F0F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1AAB8B',
  },
  amenityChipText: {
    fontSize: 13,
    color: '#1AAB8B',
    fontWeight: '500',
  },
  moreChip: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moreChipText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  addAmenitiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  addAmenitiesText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },

  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});