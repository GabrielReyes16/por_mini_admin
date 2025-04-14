import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qhagemppalwpbqgvnnsh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYWdlbXBwYWx3cGJxZ3ZubnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNzYzMDcsImV4cCI6MjA1OTc1MjMwN30.SbX0MByCvsMAlwImQbgrVba356oJ9t0b571VRghoS7w'

export const supabase = createClient(supabaseUrl, supabaseKey)
