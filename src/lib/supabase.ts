/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cbavndsrvoyinqkaiqhk.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_QB8mSFVKpEN3mAyHGMks1A_j2NdGc5g";

export const supabase = createClient(supabaseUrl, supabaseKey);
