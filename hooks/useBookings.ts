import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types/types';

export const useBookings = (userId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          office:office_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error in fetchBookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBookings();

      // Subscribe to real-time updates for booking status changes
      const subscription = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Update the specific booking in local state
            setBookings(prev => 
              prev.map(booking => 
                booking.id === payload.new.id 
                  ? { ...booking, ...payload.new }
                  : booking
              )
            );
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const createBooking = async (bookingData: {
    office_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
  }) => {
    try {
      if (!userId) {
        return { data: null, error: new Error('User not logged in') };
      }

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            ...bookingData,
            user_id: userId,
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (bookingError) {
        return { data: null, error: bookingError };
      }

      // Increment the booking count on the office
      const { error: updateError } = await supabase.rpc('increment_booking_count', {
        office_id: bookingData.office_id
      });

      if (updateError) {
        console.error('Error updating booking count:', updateError);
        // Continue anyway since booking was created
      }

      // Refresh bookings list
      await fetchBookings();

      return { data: booking, error: null };
    } catch (error: any) {
      console.error('Error in createBooking:', error);
      return { data: null, error };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        return { error };
      }

      // Refresh bookings list
      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      console.error('Error in cancelBooking:', error);
      return { error };
    }
  };

  return {
    bookings,
    loading,
    refetch: fetchBookings,
    createBooking,
    cancelBooking,
  };
};