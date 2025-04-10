import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://adgbpknynvzojozapyar.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ2Jwa255bnZ6b2pvemFweWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDYxODMsImV4cCI6MjA1ODkyMjE4M30.pRt-cRl0VkC1oA9ARcaDDvKNJTKNbotBBxGEfVMsQO8";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
