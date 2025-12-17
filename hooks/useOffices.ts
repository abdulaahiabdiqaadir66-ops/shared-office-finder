import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Office } from '../types/types';

export const useOffices = (ownerId?: string) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffices = async () => {
    try {
      let query = supabase
        .from('offices')
        .select('*')
        .order('created_at', { ascending: false });

      // If ownerId is provided, only fetch their offices
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching offices:', error);
      } else {
        setOffices(data || []);
      }
    } catch (error) {
      console.error('Error in fetchOffices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, [ownerId]);

  const updateOfficeAvailability = async (officeId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('offices')
        .update({ is_available: isAvailable })
        .eq('id', officeId);

      if (error) {
        console.error('Error updating office:', error);
        return { error };
      }

      // Update local state
      setOffices(prev => 
        prev.map(office => 
          office.id === officeId 
            ? { ...office, is_available: isAvailable }
            : office
        )
      );

      return { error: null };
    } catch (error: any) {
      console.error('Error in updateOfficeAvailability:', error);
      return { error };
    }
  };

  const deleteOffice = async (officeId: string) => {
    try {
      const { error } = await supabase
        .from('offices')
        .delete()
        .eq('id', officeId);

      if (error) {
        console.error('Error deleting office:', error);
        return { error };
      }

      // Update local state
      setOffices(prev => prev.filter(office => office.id !== officeId));
      return { error: null };
    } catch (error: any) {
      console.error('Error in deleteOffice:', error);
      return { error };
    }
  };

  return {
    offices,
    loading,
    refetch: fetchOffices,
    updateOfficeAvailability,
    deleteOffice,
  };
};