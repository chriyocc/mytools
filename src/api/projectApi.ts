import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const projectApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    
    
    if (error) throw error;
    return data as ProjectRow[];
  },

  async getAllProjectsTitle() {
    const { data, error } = await supabase
      .from('projects')
      .select('title, slug');
    
    if (error) throw error;
    return data as { title: string; slug: string }[];
  },

  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select();
    
    if (error) throw error;
    return data?.[0] as ProjectRow;
  },

  async update(id: string, project: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0] as ProjectRow;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ProjectRow;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};