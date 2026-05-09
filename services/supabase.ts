import { createClient } from '@supabase/supabase-js';

var SUPABASE_URL = 'https://dkiusfegnudxyggurmxy.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXVzZmVnbnVkeHlnZ3VybXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODkyODgsImV4cCI6MjA5Mzg2NTI4OH0.pXtGnSK60f-hr8E8BstMSoeq1qHslKU9GK0QjL1DHeg';

export var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
