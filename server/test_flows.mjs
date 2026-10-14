const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full-Stack Pizza Verification Suite...');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  assert(healthRes.status === 'healthy', 'Health endpoint responds with healthy');

  // 2. Fetch Pizzas Catalog
  const pizzaRes = await fetch(`${BASE_URL}/pizzas`).then((r) => r.json());
  assert(pizzaRes.success && pizzaRes.data.length >= 6, `Fetched ${pizzaRes.data?.length} signature pizzas`);

  // 3. Fetch Inventory (5 bases, 5 sauces, cheeses, veggies)
  const invRes = await fetch(`${BASE_URL}/inventory`).then((r) => r.json());
  assert(invRes.success && invRes.grouped.bases.length === 5, 'Found exactly 5 pizza bases');
  assert(invRes.grouped.sauces.length === 5, 'Found exactly 5 pizza sauces');
  assert(invRes.grouped.cheeses.length >= 4, 'Found cheese varieties');
  assert(invRes.grouped.vegetables.length >= 6, 'Found vegetable selections');

  // 4. User Registration with Email Verification
  const testEmail = `tester_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Wonder',
      email: testEmail,
      password: 'Password@123',
    }),
  }).then((r) => r.json());
  assert(regRes.success && regRes.data?.verificationToken, 'User registration dispatches verification token');

  // Attempt login before verification (should fail or require verification)
  const unverifiedLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password@123' }),
  });
  assert(unverifiedLogin.status === 403, 'Unverified user cannot log in (403)');

  // Verify email
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email?token=${regRes.data.verificationToken}`).then((r) => r.json());
  assert(verifyRes.success && verifyRes.token, 'Email verified successfully and JWT token returned');

  // Login after verification
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password@123' }),
  }).then((r) => r.json());
  assert(loginRes.success && loginRes.token, 'Verified user logged in successfully with JWT');
  const userToken = loginRes.token;

  // 5. Forgot Password Flow
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  }).then((r) => r.json());
  assert(forgotRes.success && forgotRes.resetToken, 'Forgot password generates reset token');

  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: forgotRes.resetToken,
      newPassword: 'NewPassword@456',
    }),
  }).then((r) => r.json());
  assert(resetRes.success, 'Password successfully reset');

  // Verify login with new password
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'NewPassword@456' }),
  }).then((r) => r.json());
  assert(newLoginRes.success, 'Logged in with new reset password');

  // 6. Razorpay Payment Order & Checkout
  const initialBaseStock = invRes.grouped.bases.find((b) => b.name === 'Hand Tossed').stock;
  const initialSauceStock = invRes.grouped.sauces.find((s) => s.name === 'Classic Marinara').stock;

  const paymentOrderRes = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newLoginRes.token}`,
    },
    body: JSON.stringify({ amount: 24.50, currency: 'USD' }),
  }).then((r) => r.json());
  assert(paymentOrderRes.success && paymentOrderRes.data?.id, 'Razorpay payment order created');

  // Place custom pizza order (simulated success)
  const placeOrderRes = await fetch(`${BASE_URL}/orders/place-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newLoginRes.token}`,
    },
    body: JSON.stringify({
      items: [
        {
          type: 'custom',
          pizzaName: 'Masterpiece Hand Tossed',
          quantity: 2,
          unitPrice: 15.50,
          totalPrice: 31.00,
          customization: {
            base: 'Hand Tossed',
            sauce: 'Classic Marinara',
            cheese: 'Mozzarella',
            vegetables: ['Black Olives', 'Bell Peppers'],
          },
        },
      ],
      deliveryAddress: {
        fullName: 'Alice Wonder',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        zipCode: '97477',
        phone: '+1 555-4321',
      },
      subtotal: 31.00,
      tax: 1.55,
      deliveryFee: 0,
      totalAmount: 32.55,
      razorpayOrderId: paymentOrderRes.data.id,
      razorpayPaymentId: 'pay_test_suite_999',
      razorpaySignature: 'sig_test_suite_999',
    }),
  }).then((r) => r.json());
  assert(placeOrderRes.success && placeOrderRes.data?.orderNumber, `Order placed successfully (#${placeOrderRes.data?.orderNumber})`);

  // Verify stock decremented automatically!
  const afterInvRes = await fetch(`${BASE_URL}/inventory`).then((r) => r.json());
  const newBaseStock = afterInvRes.grouped.bases.find((b) => b.name === 'Hand Tossed').stock;
  const newSauceStock = afterInvRes.grouped.sauces.find((s) => s.name === 'Classic Marinara').stock;
  assert(newBaseStock === initialBaseStock - 2, `Hand Tossed crust automatically decremented from ${initialBaseStock} to ${newBaseStock}`);
  assert(newSauceStock === initialSauceStock - 2, `Classic Marinara sauce automatically decremented from ${initialSauceStock} to ${newSauceStock}`);

  // 7. Admin Login (Separate portal)
  const adminLoginRes = await fetch(`${BASE_URL}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@slicecraft.com',
      password: 'Admin@12345',
      adminKey: 'admin_secret_portal_key_secure_2026',
    }),
  }).then((r) => r.json());
  assert(adminLoginRes.success && adminLoginRes.user?.role === 'admin', 'Separate admin login verified with admin role');
  const adminToken = adminLoginRes.token;

  // 8. Admin Manual Stock Update
  const thinCrust = afterInvRes.grouped.bases.find((b) => b.name === 'Thin Crust');
  const manualUpdateRes = await fetch(`${BASE_URL}/inventory/${thinCrust._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ delta: 5 }),
  }).then((r) => r.json());
  assert(manualUpdateRes.success && manualUpdateRes.data.stock === thinCrust.stock + 5, `Manual stock update (+5) successful (${manualUpdateRes.data.stock})`);

  // 9. Automated Stock Notification Alert Check (node-cron trigger)
  const alertCheckRes = await fetch(`${BASE_URL}/inventory/check-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
  }).then((r) => r.json());
  assert(alertCheckRes.success, 'Low-stock inventory audit check executed with email dispatch');

  // 10. Admin Order Status Update
  const updateStatusRes = await fetch(`${BASE_URL}/orders/admin/status/${placeOrderRes.data._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'In Kitchen' }),
  }).then((r) => r.json());
  assert(updateStatusRes.success && updateStatusRes.data.status === 'In Kitchen', 'Order status updated to "In Kitchen"');

  const updateStatusRes2 = await fetch(`${BASE_URL}/orders/admin/status/${placeOrderRes.data._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Sent to Delivery' }),
  }).then((r) => r.json());
  assert(updateStatusRes2.success && updateStatusRes2.data.status === 'Sent to Delivery', 'Order status updated to "Sent to Delivery"');

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passCount} Passed, ${failCount} Failed.`);
  console.log(`========================================`);
}

runTests().catch(console.error);
