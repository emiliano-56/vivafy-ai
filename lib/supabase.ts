import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yfwxpyxjuhuomnqiwuow.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd3hweXhqdWh1b21ucWl3dW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjAzMDMsImV4cCI6MjA5Mjg5NjMwM30.27WnIUghQAVRAYepJAcuZ2B5f3xKmXXIjpOQF_j9XsY'

console.log('[v0] Supabase URL exists:', !!supabaseUrl)
console.log('[v0] Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
