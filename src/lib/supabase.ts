import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://egyagrxmlgvjfyarwawm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GzWB6ou4cq0wFxR_ZZn3dA_NWoMNarI';

export const supabase = createClient(supabaseUrl, supabaseKey);
