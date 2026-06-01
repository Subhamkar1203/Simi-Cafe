import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../simi-cafe-backend/.env' });
async function sync() {
  const c = await mysql.createConnection({host: process.env.DB_HOST || '127.0.0.1', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'simi_cafe'});
  await c.query("UPDATE orders SET payment_confirmed = 1 WHERE status = 'paid' OR status = 'completed'");
  await c.query("UPDATE users u SET total_visits = (SELECT COUNT(*) FROM reservations r WHERE r.user_id = u.id AND r.status = 'completed')");
  await c.query("UPDATE users u SET successful_payments = (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.payment_confirmed = 1)");
  
  const [users] = await c.query("SELECT id, successful_payments FROM users");
  for (const u of users) {
    const p = u.successful_payments;
    const expected = [];
    if (p >= 1) expected.push({t:'Totoro Charm', c:1});
    if (p >= 3) expected.push({t:'Calcifer Charm', c:3});
    if (p >= 5) expected.push({t:'Kodama Charm', c:5});
    if (p >= 10) expected.push({t:'Susuwatari Charm', c:10});
    
    const [existing] = await c.query("SELECT charm_type FROM charms WHERE user_id=?", [u.id]);
    const extTypes = existing.map(x=>x.charm_type);
    
    for (const ex of expected) {
      if (!extTypes.includes(ex.t)) {
        await c.query("INSERT INTO charms (user_id, charm_type, earned_after_payment_count) VALUES (?,?,?)", [u.id, ex.t, ex.c]);
      }
    }
    await c.query("UPDATE users SET charm_count = (SELECT COUNT(*) FROM charms WHERE user_id=?) WHERE id=?", [u.id, u.id]);
  }
  console.log('success');
  process.exit(0);
}
sync().catch(console.error);
