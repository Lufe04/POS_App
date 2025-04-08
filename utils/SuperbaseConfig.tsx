import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://exrlwotqifxayviqieyf.supabase.co'; // <- reemplaza por tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cmx3b3RxaWZ4YXl2aXFpZXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjg3MjgsImV4cCI6MjA1OTY0NDcyOH0.CRtOMb3dqTSq8dz6BKrdmULbgcVb2_d1vtTXl4vBg7k'; // <- reemplaza por tu anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getPublicImageUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${path}`;
        