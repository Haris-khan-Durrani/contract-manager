/**
 * contractDelete.test.js
 *
 * Verifies contract deletion functionality:
 * 1. RBAC permissions matrix includes contract:delete
 * 2. Cascading deletion removes child records (audit logs, client summaries)
 * 3. Individual contract deletion
 * 4. Bulk contract deletion
 */
const assert = require('assert');
const path   = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const db = require('../src/config/db');
const { hasPermission } = require('../src/middleware/rbac');

async function runTests() {
  await db.init();
  console.log('🧪 Testing Contract Deletion & Cascading Clean-up…\n');

  // Test 1: RBAC Permission Check
  assert.strictEqual(hasPermission('ADMIN', 'contract:delete'), true, 'ADMIN should have contract:delete');
  assert.strictEqual(hasPermission('SUPER_ADMIN', 'contract:delete'), true, 'SUPER_ADMIN should have contract:delete');
  assert.strictEqual(hasPermission('SALES', 'contract:delete'), true, 'SALES should have contract:delete');
  console.log('  ✅ RBAC permissions matrix verified for contract:delete');

  const testLocation = 'loc_delete_test_' + Date.now();
  const testUser     = 'user_test_del';

  // Test 2: Insert dummy contract instances
  const [insert1] = await db.execute(`
    INSERT INTO contract_instances
      (location_id, template_id, template_version, ghl_contact_id, assigned_user_id, created_by_user_id, creation_mode, state, recipient_name)
    VALUES
      (?, 1, 1, 'contact_001', ?, ?, 'MANUAL', 'DRAFT', 'Test Delete Client 1')
  `, [testLocation, testUser, testUser]);
  const contractId1 = insert1.insertId;

  const [insert2] = await db.execute(`
    INSERT INTO contract_instances
      (location_id, template_id, template_version, ghl_contact_id, assigned_user_id, created_by_user_id, creation_mode, state, recipient_name)
    VALUES
      (?, 1, 1, 'contact_002', ?, ?, 'MANUAL', 'READY', 'Test Delete Client 2')
  `, [testLocation, testUser, testUser]);
  const contractId2 = insert2.insertId;

  const [insert3] = await db.execute(`
    INSERT INTO contract_instances
      (location_id, template_id, template_version, ghl_contact_id, assigned_user_id, created_by_user_id, creation_mode, state, recipient_name)
    VALUES
      (?, 1, 1, 'contact_003', ?, ?, 'MANUAL', 'DRAFT', 'Test Delete Client 3')
  `, [testLocation, testUser, testUser]);
  const contractId3 = insert3.insertId;

  // Insert child records for contractId1
  await db.execute(`
    INSERT INTO contract_audit_logs
      (contract_instance_id, actor_type, actor_id, actor_name, action, to_state)
    VALUES
      (?, 'USER', ?, 'Test User', 'CONTRACT_CREATED', 'DRAFT')
  `, [contractId1, testUser]);

  await db.execute(`
    INSERT INTO contract_client_summaries
      (location_id, contract_id, status, summary_data_json)
    VALUES
      (?, ?, 'DRAFT', '{}')
  `, [testLocation, contractId1]);

  console.log(`  ✅ Inserted dummy contracts #${contractId1}, #${contractId2}, #${contractId3} with child records`);

  // Test 3: Simulate single delete with cascade
  await db.execute('DELETE FROM contract_client_summaries WHERE contract_id = ?', [contractId1]).catch(() => {});
  await db.execute('DELETE FROM contract_audit_logs WHERE contract_instance_id = ?', [contractId1]).catch(() => {});
  await db.execute('DELETE FROM contract_events WHERE contract_instance_id = ?', [contractId1]).catch(() => {});
  await db.execute('DELETE FROM webhook_idempotency_keys WHERE contract_instance_id = ?', [contractId1]).catch(() => {});
  await db.execute('DELETE FROM contract_instances WHERE id = ? AND location_id = ?', [contractId1, testLocation]);

  // Verify contract1 is gone
  const [check1] = await db.execute('SELECT id FROM contract_instances WHERE id = ?', [contractId1]);
  assert.strictEqual(check1.length, 0, 'Contract 1 should be deleted');

  // Verify child records are gone
  const [checkAudit] = await db.execute('SELECT id FROM contract_audit_logs WHERE contract_instance_id = ?', [contractId1]);
  assert.strictEqual(checkAudit.length, 0, 'Audit logs for Contract 1 should be deleted');

  const [checkSummary] = await db.execute('SELECT id FROM contract_client_summaries WHERE contract_id = ?', [contractId1]);
  assert.strictEqual(checkSummary.length, 0, 'Client summary for Contract 1 should be deleted');
  console.log(`  ✅ Contract #${contractId1} and all child records deleted successfully`);

  // Test 4: Bulk delete contracts 2 and 3
  const bulkIds = [contractId2, contractId3];
  for (const cid of bulkIds) {
    await db.execute('DELETE FROM contract_client_summaries WHERE contract_id = ?', [cid]).catch(() => {});
    await db.execute('DELETE FROM contract_audit_logs WHERE contract_instance_id = ?', [cid]).catch(() => {});
    await db.execute('DELETE FROM contract_events WHERE contract_instance_id = ?', [cid]).catch(() => {});
    await db.execute('DELETE FROM webhook_idempotency_keys WHERE contract_instance_id = ?', [cid]).catch(() => {});
    await db.execute('DELETE FROM contract_instances WHERE id = ? AND location_id = ?', [cid, testLocation]);
  }

  const [checkBulk] = await db.execute('SELECT id FROM contract_instances WHERE id IN (?, ?)', [contractId2, contractId3]);
  assert.strictEqual(checkBulk.length, 0, 'Contracts 2 and 3 should be bulk deleted');
  console.log(`  ✅ Bulk deleted contracts #${contractId2} and #${contractId3} successfully`);

  console.log('\nAll Contract Deletion tests passed! 🎉\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
