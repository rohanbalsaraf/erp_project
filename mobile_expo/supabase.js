import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smwdftcawqjhfffaavdn.supabase.co';
const supabaseAnonKey = 'sb_publishable_u6FOWpJhVTzyPbjJHopq_Q_IJLMoeBB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
