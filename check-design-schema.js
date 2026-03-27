// Quick check to see if designs table has wedding_id column
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jzoaodxbicxknchgylrg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b2FvZHhiaWN4a25jaGd5bHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzQ2ODksImV4cCI6MjA4OTQxMDY4OX0.bmvzcrlqQVRfpkYmenraK2enTMZAs5DCkBX5lUoy9BU'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkSchema() {
  try {
    // Check if wedding_id column exists
    const { data, error } = await sb.rpc('get_table_columns', { table_name: 'designs' })
    
    if (error) {
      console.log('Error checking schema:', error.message)
      
      // Fallback: try a query that would fail if wedding_id doesn't exist
      try {
        const { data: testData, error: testError } = await sb
          .from('designs')
          .select('user_id, wedding_id')
          .limit(1)
        
        if (testError && testError.message.includes('column "wedding_id" does not exist')) {
          console.log('❌ wedding_id column does NOT exist - migration not applied')
        } else if (testError) {
          console.log('⚠️ Other error:', testError.message)
        } else {
          console.log('✅ wedding_id column exists - migration applied')
        }
      } catch (e) {
        console.log('⚠️ Schema check failed:', e.message)
      }
    } else {
      console.log('✅ Schema data:', data)
    }
  } catch (e) {
    console.log('❌ Schema check failed:', e.message)
  }
}

checkSchema()
