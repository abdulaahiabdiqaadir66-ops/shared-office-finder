import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { OwnerBooking } from '../types/types';

export const useOwnerBookings = (ownerId?: string) => {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerBookings = async () => {
    try {
      if (!ownerId) return;

      console.log('Fetching bookings for owner:', ownerId);

      // First, get all offices owned by this owner
      const { data: ownerOffices, error: officesError } = await supabase
        .from('offices')
        .select('id')
        .eq('owner_id', ownerId);

      if (officesError) {
        console.error('Error fetching owner offices:', officesError);
        return;
      }

      if (!ownerOffices || ownerOffices.length === 0) {
        console.log('No offices found for this owner');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Extract office IDs
      const officeIds = ownerOffices.map(office => office.id);
      console.log('Owner office IDs:', officeIds);

      // Now fetch bookings for these specific offices
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          office:office_id (*),
          user:user_id (id, email, full_name, phone_number)
        `)
        .in('office_id', officeIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owner bookings:', error);
      } else {
        console.log('Fetched bookings:', data?.length || 0);
        // Type assertion to ensure we have the correct type
        setBookings((data || []) as OwnerBooking[]);
      }
    } catch (error) {
      console.error('Error in fetchOwnerBookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ownerId) {
      fetchOwnerBookings();

      // Subscribe to real-time updates for owner bookings
      const subscription = supabase
        .channel('owner-bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'bookings'
          },
          async (payload) => {
            // Refetch all bookings when any change occurs
            // This ensures we get the latest data with proper joins
            await fetchOwnerBookings();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [ownerId]);

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        return { error };
      }

      // Update local state optimistically
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status }
            : booking
        )
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error in updateBookingStatus:', error);
      return { error };
    }
  };

  return {
    bookings,
    loading,
    refetch: fetchOwnerBookings,
    updateBookingStatus,
  };
};