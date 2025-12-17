import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvxvcxmkzxlmsytyufmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eHZjeG1renhsbXN5dHl1Zm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDg5NTUsImV4cCI6MjA3ODUyNDk1NX0.ICuCk4YcAAr5rJHdA4hR4WiCIbpkGfoc2Zz1Mga-w7o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);