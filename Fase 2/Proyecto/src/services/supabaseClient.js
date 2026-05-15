import { createClient } from '@supabase/supabase-js'
//Momentaneo!!!!!!!!
const SUPABASE_URL = 'https://uilnpkauvsyvbcgazhiw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2g8qQQpVR1m1lsRjQe2XUw_p9j-AkP0'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)