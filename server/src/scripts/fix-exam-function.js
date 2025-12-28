import db from '../config/db.js';

async function fixExamFunction() {
  const client = await db.connect();
  try {
    console.log('🔧 Dropping all versions of fn_create_exam_record...');
    
    // Drop all possible versions
    await client.query(`
      DROP FUNCTION IF EXISTS fn_create_exam_record(BIGINT, BIGINT, TEXT, TEXT, TIMESTAMPTZ) CASCADE;
      DROP FUNCTION IF EXISTS fn_create_exam_record(BIGINT, BIGINT, TEXT, TEXT) CASCADE;
      DROP FUNCTION IF EXISTS fn_create_exam_record CASCADE;
    `);
    
    console.log('✅ Functions dropped successfully');
    console.log('📌 Now run: npm run migrate');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixExamFunction();
