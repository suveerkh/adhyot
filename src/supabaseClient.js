import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yituydksabhyimalrqxa.supabase.co',
  'sb_publishable_qTcl_K6-pyLJ1knrKTU_Ng_KWUzXiBk'
)

export default supabase