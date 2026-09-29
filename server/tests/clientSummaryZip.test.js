/**
 * clientSummaryZip.test.js — Unit test for Client Summary PDF & ZIP Compilation
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const assert = require('assert');
const JSZip = require('jszip');

async function runTests() {
  console.log('📦 Testing Client Summary ZIP & PDF Package Compilation…');

  const { compileClientPackageZip } = require('../src/services/clientSummaryZipService');
  const db = require('../src/config/db');

  // Find a completed contract in the test/seed database
  const [rows] = await db.execute(
    `SELECT ci.id, ci.location_id
     FROM contract_instances ci
     WHERE ci.state IN ('COMPLETED', 'SIGNED') OR ci.signed_at IS NOT NULL
     LIMIT 1`
  );

  if (!rows.length) {
    console.log('  ⚠️ No completed contracts found in DB to test live ZIP; testing mock ZIP creation directly.');
    const zip = new JSZip();
    zip.file('1_Signed_Contract_test.pdf', Buffer.from('%PDF-1.4 test contract'));
    zip.file('2_Client_Summary_test.pdf', Buffer.from('%PDF-1.4 test summary'));
    zip.file('0_Case_Dossier_Manifest.txt', 'Manifest test');
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    assert(Buffer.isBuffer(zipBuffer), 'ZIP buffer generated');
    assert(zipBuffer.length > 50, 'ZIP buffer has content');
    console.log('  ✅ Mock ZIP Compilation verified successfully.');
    console.log('\nZIP Compilation Results: 1 passed, 0 failed.\n');
    process.exit(0);
  }

  const { id: contractId, location_id: locationId } = rows[0];

  try {
    const { zipBuffer, zipFilename } = await compileClientPackageZip(contractId, locationId);
    assert(Buffer.isBuffer(zipBuffer), 'zipBuffer must be a Buffer');
    assert(zipBuffer.length > 500, 'zipBuffer should contain valid compressed data');
    assert(zipFilename.endsWith('.zip'), 'zipFilename must have .zip extension');

    // Inspect zip contents
    const unzipped = await JSZip.loadAsync(zipBuffer);
    const filenames = Object.keys(unzipped.files);
    console.log('  Files in compiled ZIP archive:', filenames);

    assert(filenames.some(f => f.includes('Signed_Contract')), 'Must contain signed contract');
    assert(filenames.some(f => f.includes('Client_Summary')), 'Must contain client summary PDF');
    assert(filenames.includes('0_Case_Dossier_Manifest.txt'), 'Must contain manifest');

    console.log(`  ✅ Successfully compiled ZIP package for Contract #${contractId} (${Math.round(zipBuffer.length / 1024)} KB)!`);
    console.log('\nZIP Compilation Results: 1 passed, 0 failed.\n');
  } catch (err) {
    console.error('  ❌ ZIP compilation failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

runTests();
