import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ixspfaizwlkvzozfaiyx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4c3BmYWl6d2xrdnpvemZhaXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTk4MzUsImV4cCI6MjA1NjQzNTgzNX0._qA0EzRDyLp1mjH5DbDq4_mQmOwMGbDrzbMeq86hos8";
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
