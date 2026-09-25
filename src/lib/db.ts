import { supabase } from './supabase';

export const getHeroSlides = async () => {
  const { data, error } = await supabase.from('hero_slides').select('*');
  if (error) throw error;
  return data;
};

export const addHeroSlide = async (slide: any) => {
  const { error } = await supabase.from('hero_slides').upsert(slide);
  if (error) throw error;
};

export const deleteHeroSlide = async (id: string) => {
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);
  if (error) throw error;
};
