import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database.types';

type JourneyRow = Database['public']['Tables']['journey']['Row'];
type JourneyInsert = Database['public']['Tables']['journey']['Insert'];
type JourneyUpdate = Database['public']['Tables']['journey']['Update'];
type MonthRow = Database['public']['Tables']['months']['Row'];
type MonthInsert = Database['public']['Tables']['months']['Insert'];

export const journeyApi = {
  // ===== JOURNEY METHODS =====
  
  /**
   * Get all journey entries with their month information
   */
  async getAll(): Promise<JourneyRow[]> {
    const { data, error } = await supabase
      .from('journey')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journeys:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a single journey entry by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('journey')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching journey:', error);
      throw error;
    }

    return data as JourneyRow;
  },

  /**
   * Get journey entries by month ID
   */
  async getByMonthId(monthId: number): Promise<JourneyRow[]> {
    const { data, error } = await supabase
      .from('journey')
      .select('*')
      .eq('month_id', monthId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journeys by month:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get journey entries by year
   */
  async getByYear(year: number): Promise<JourneyRow[]> {
    const { data, error } = await supabase
      .from('journey')
      .select(`
        *,
        months!inner(year, month_num)
      `)
      .eq('months.year', year)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journeys by year:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create a new journey entry
   */
  async create(journey: JourneyInsert): Promise<JourneyRow> {
    const { data, error } = await supabase
      .from('journey')
      .insert(journey)
      .select()
      .single();

    if (error) {
      console.error('Error creating journey:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing journey entry
   */
  async update(id: string, journey: JourneyUpdate): Promise<JourneyRow> {
    const { data, error } = await supabase
      .from('journey')
      .update(journey)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journey:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a journey entry
   */
  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('journey')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting journey:', error);
      throw error;
    }
  },

  // ===== MONTHS METHODS =====

  /**
   * Get all months
   */
  async getMonths(): Promise<MonthRow[]> {
    const { data, error } = await supabase
      .from('months')
      .select('*')
      .order('year', { ascending: false })
      .order('month_num', { ascending: true });

    if (error) {
      console.error('Error fetching months:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get months by year
   */
  async getMonthsByYear(year: number): Promise<MonthRow[]> {
    const { data, error } = await supabase
      .from('months')
      .select('*')
      .eq('year', year)
      .order('month_num', { ascending: true });

    if (error) {
      console.error('Error fetching months by year:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a single month by ID
   */
  async getMonthById(id: number): Promise<MonthRow | null> {
    const { data, error } = await supabase
      .from('months')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching month:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new month
   */
  async createMonth(month: MonthInsert): Promise<MonthRow> {
    const { data, error } = await supabase
      .from('months')
      .insert(month)
      .select()
      .single();

    if (error) {
      console.error('Error creating month:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get or create a month (useful for ensuring a month exists before adding journey)
   */
  async getOrCreateMonth(year: number, monthNum: number): Promise<MonthRow> {
    // Validate month_num is between 1-12
    if (monthNum < 1 || monthNum > 12) {
      throw new Error('month_num must be between 1 and 12');
    }

    // First, try to get the month
    const { data: existingMonth, error: fetchError } = await supabase
      .from('months')
      .select('*')
      .eq('year', year)
      .eq('month_num', monthNum)
      .single();

    if (existingMonth) {
      return existingMonth;
    }

    // If not found, create it
    if (fetchError && fetchError.code === 'PGRST116') {
      return await this.createMonth({ year, month_num: monthNum });
    }

    // If other error, throw it
    if (fetchError) {
      console.error('Error fetching month:', fetchError);
      throw fetchError;
    }

    // This shouldn't happen, but TypeScript needs it
    throw new Error('Unexpected error in getOrCreateMonth');
  },

  /**
   * Get journey entries with their month details (joined query)
   */
  async getJourneysWithMonths(): Promise<Array<JourneyRow & { months: MonthRow | null }>> {
    const { data, error } = await supabase
      .from('journey')
      .select(`
        *,
        months (*)
      `)
      .order('months(year)', { ascending: false })
      .order('months(month_num)', { ascending: false });

    if (error) {
      console.error('Error fetching journeys with months:', error);
      throw error;
    }

    return (data as Array<JourneyRow & { months: MonthRow | null }>) || [];
  },

  /**
   * Get unique years from months table
   */
  async getAvailableYears(): Promise<number[]> {
    const { data, error } = await supabase
      .from('months')
      .select('year')
      .order('year', { ascending: false });

    if (error) {
      console.error('Error fetching years:', error);
      throw error;
    }

    // Get unique years
    const uniqueYears = [...new Set(data?.map(m => m.year) || [])];
    return uniqueYears;
  },
};