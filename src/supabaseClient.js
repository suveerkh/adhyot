import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_PUBLISHABLE
)

export default supabase