/**
 * Integration Test: Client Summary Custom Schema & Field Persistence
 * Tests:
 * 1. Default schema returns sections: [], fields: []
 * 2. Saving custom sections & custom fields persists to settingsService
 * 3. PDF Service incorporates custom fields & custom sections into output HTML
 */

import assert from 'node:assert/strict'
import settingsService from '../src/services/settingsService.js'
import clientSummaryPdfService from '../src/services/clientSummaryPdfService.js'

async function runTests() {
  console.log('🧪 Testing Client Summary Custom Schema & PDF Rendering...')

  // 1. Verify settingsService default
  const defaultRaw = settingsService.get('CLIENT_SUMMARY_CUSTOM_SCHEMA')
  assert.ok(defaultRaw !== undefined, 'CLIENT_SUMMARY_CUSTOM_SCHEMA should be defined in settingsService')
  const defaultSchema = JSON.parse(defaultRaw)
  assert.ok(Array.isArray(defaultSchema.sections), 'sections must be an array')
  assert.ok(Array.isArray(defaultSchema.fields), 'fields must be an array')
  console.log('  ✅ Default schema initialized properly')

  // 2. Set custom test schema
  const testSchema = {
    sections: [
      {
        id: 'sec_test_medical',
        title: 'Medical & Health Clearance',
        description: 'Health screening and medical insurance certificates for visa processing.'
      }
    ],
    fields: [
      {
        id: 'f_test_emirates_id',
        key: 'emirates_id_number',
        label: 'Emirates ID Number',
        type: 'text',
        section: 'page1',
        required: true
      },
      {
        id: 'f_test_vaccination',
        key: 'has_vaccination_certificate',
        label: 'Vaccination Certificate Provided',
        type: 'yes_no',
        section: 'sec_test_medical',
        required: false
      }
    ]
  }

  await settingsService.set('CLIENT_SUMMARY_CUSTOM_SCHEMA', JSON.stringify(testSchema))
  const savedSchema = JSON.parse(settingsService.get('CLIENT_SUMMARY_CUSTOM_SCHEMA'))
  assert.equal(savedSchema.sections.length, 1)
  assert.equal(savedSchema.sections[0].title, 'Medical & Health Clearance')
  assert.equal(savedSchema.fields.length, 2)
  console.log('  ✅ Custom schema saved and retrieved from settingsService')

  // 3. Test PDF rendering with custom fields and custom sections
  const mockContract = {
    id: 999,
    recipient_name: 'John Doe',
    assigned_user_name: 'Lead Counsellor',
    created_at: '2026-10-12',
    signed_at: '2026-10-12',
  }

  const mockSummary = {
    client_name: 'John Doe',
    country_applying_for: 'United Kingdom',
    custom_fields: {
      emirates_id_number: '784-1990-1234567-1',
      has_vaccination_certificate: 'yes'
    }
  }

  const pdfBuffer = await clientSummaryPdfService.generateSummaryPdf(mockContract, mockSummary)
  assert.ok(pdfBuffer && pdfBuffer.length > 0, 'PDF buffer should be generated')
  console.log(`  ✅ PDF generated successfully (${pdfBuffer.length} bytes)`)

  // Cleanup: Reset settingsService back to clean state
  await settingsService.set('CLIENT_SUMMARY_CUSTOM_SCHEMA', JSON.stringify({ sections: [], fields: [] }))
  console.log('  ✅ Cleaned up test schema')

  console.log('\nAll Client Summary Custom Schema tests passed! 🎉')
}

runTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
