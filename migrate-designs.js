// Migrate existing designs to have proper wedding_id values
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jzoaodxbicxknchgylrg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b2FvZHhiaWN4a25jaGd5bHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzQ2ODksImV4cCI6MjA4OTQxMDY4OX0.bmvzcrlqQVRfpkYmenraK2enTMZAs5DCkBX5lUoy9BU'

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

async function migrateDesigns() {
  try {
    console.log('Checking for designs without wedding_id...')
    
    // Get designs without wedding_id
    const { data: oldDesigns, error: fetchError } = await sb
      .from('designs')
      .select('id, user_id')
      .is('wedding_id', null)
    
    if (fetchError) {
      console.log('❌ Error fetching designs:', fetchError.message)
      return
    }
    
    if (!oldDesigns || oldDesigns.length === 0) {
      console.log('✅ All designs already have wedding_id')
      return
    }
    
    console.log(`Found ${oldDesigns.length} designs without wedding_id`)
    
    // Get user's weddings to assign wedding_id
    for (const design of oldDesigns) {
      const { data: weddings, error: weddingError } = await sb
        .from('weddings')
        .select('id')
        .eq('user_id', design.user_id)
        .limit(1)
      
      if (weddingError) {
        console.log(`❌ Error fetching wedding for user ${design.user_id}:`, weddingError.message)
        continue
      }
      
      if (!weddings || weddings.length === 0) {
        console.log(`⚠️ No wedding found for user ${design.user_id}`)
        continue
      }
      
      const weddingId = weddings[0].id
      
      // Update the design with wedding_id
      const { error: updateError } = await sb
        .from('designs')
        .update({ wedding_id: weddingId })
        .eq('id', design.id)
      
      if (updateError) {
        console.log(`❌ Error updating design ${design.id}:`, updateError.message)
      } else {
        console.log(`✅ Updated design ${design.id} with wedding_id ${weddingId}`)
      }
    }
    
    console.log('✅ Migration complete')
  } catch (e) {
    console.log('❌ Migration failed:', e.message)
  }
}

migrateDesigns()
