import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import ExcelJS from 'exceljs';
import { startAPI, gql, keys, verification, db, errorCode, origin } from './auth-harness.mjs';
import {
  adminGql,
  createAdmin,
  loginAdmin,
  cleanupAdmin,
  admins,
  products,
  createCustomer,
} from './admin-harness.mjs';
const coupons = [];
const couponFields =
  'id code type value minOrderAmount maxDiscountAmount startsAt expiresAt usageLimit usageCount isActive updatedAt';
const couponSave = `mutation($id:ID,$version:String,$input:AdminCouponInput!){saveAdminCoupon(id:$id,expectedUpdatedAt:$version,input:$input){${couponFields}}}`;
const ticketFields = 'id subject status updatedAt orderNumber messages{id body fromSupport}';
const reviewFields = 'id status body rating updatedAt';
let owner, staff;
try {
  await startAPI();
  owner = await createAdmin();
  const ownerSession = await loginAdmin(owner);
  assert.equal(ownerSession.errors, undefined);
  const email = `staff-${randomBytes(6).toString('hex')}@example.test`;
  const password = randomBytes(24).toString('hex');
  const created = await adminGql(
    'mutation($input:StaffInput!){createStaff(input:$input){id email role isActive}}',
    {
      input: {
        email,
        password,
        permissions: ['ORDERS', 'ORDER_MAP', 'PRODUCTS', 'TICKETS', 'REVIEWS'],
      },
    },
    ownerSession.cookies,
  );
  assert.equal(created.errors, undefined);
  assert.equal(created.data.createStaff.role, 'STAFF');
  staff = { ...created.data.createStaff, password };
  admins.push(staff);
  const staffSession = await loginAdmin(staff);
  assert.equal(staffSession.errors, undefined);
  const me = await adminGql('{adminMe{id role isActive}}', {}, staffSession.cookies);
  assert.equal(me.data.adminMe.role, 'STAFF');
  for (const query of [
    '{adminAccounts{id}}',
    '{adminCoupons{id}}',
    '{adminCustomerExport{base64}}',
    '{adminUsers(input:{page:1}){total}}',
    '{adminDashboard{revenue}}',
    '{adminReport(input:{from:"2026-10-01",to:"2026-10-12"}){revenue}}',
  ])
    errorCode(await adminGql(query, {}, staffSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(
      'mutation($input:StaffInput!){createStaff(input:$input){id}}',
      { input: { email: 'other@example.test', password } },
      staffSession.cookies,
    ),
    'FORBIDDEN',
  );
  const category = await db.category.findFirstOrThrow();
  const slug = `operations-${randomBytes(6).toString('hex')}`;
  const productInput = {
    title: 'محصول عملیات آزمون',
    slug,
    categoryId: category.id,
    price: 100000,
    weight: '۵۰۰ گرم',
    shortDescription: 'آزمون',
    description: 'توضیحات آزمون',
    isActive: true,
    images: [{ url: '/images/products/tahini-blue.webp', alt: 'ارده آزمون' }],
  };
  const saved = await adminGql(
    'mutation($input:AdminProductInput!){saveAdminProduct(input:$input){id updatedAt}}',
    { input: productInput },
    staffSession.cookies,
  );
  assert.equal(saved.errors, undefined);
  const product = saved.data.saveAdminProduct;
  products.add(product.id);
  assert.equal(
    (await adminGql('{adminOrders(input:{page:1}){total}}', {}, staffSession.cookies)).errors,
    undefined,
  );
  const customer = await createCustomer();
  const other = await createCustomer();
  const sessions = [];
  for (const target of [customer, other]) {
    const requested = await gql(keys.request, { input: { phone: target.user.phone } });
    assert.equal(requested.errors, undefined);
    const login = await gql(keys.verify, verification(requested.data.requestOtp));
    assert.equal(login.errors, undefined);
    sessions.push(login.cookies);
  }
  const code = `BF-${randomBytes(4).toString('hex').toUpperCase()}`;
  const couponInput = {
    code,
    type: 'PERCENT',
    value: 20,
    minOrderAmount: 50000,
    maxDiscountAmount: 15000,
    startsAt: new Date(Date.now() - 60000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    usageLimit: 1,
    isActive: true,
  };
  errorCode(await adminGql(couponSave, { input: couponInput }, staffSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(couponSave, { input: { ...couponInput, value: 101 } }, ownerSession.cookies),
    'BAD_USER_INPUT',
  );
  let coupon = await adminGql(couponSave, { input: couponInput }, ownerSession.cookies);
  assert.equal(coupon.errors, undefined);
  coupon = coupon.data.saveAdminCoupon;
  coupons.push(coupon.id);
  errorCode(
    await adminGql(
      couponSave,
      { id: coupon.id, version: new Date(0).toISOString(), input: couponInput },
      ownerSession.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  const quoteInput = {
    addressId: customer.address.id,
    items: [{ productId: product.id, quantity: 1 }],
    discountCode: code.toLowerCase(),
  };
  const quote = await gql(
    'query($input:CheckoutInput!){checkoutQuote(input:$input){subtotal discount shipping total}}',
    { input: quoteInput },
    sessions[0],
  );
  assert.equal(quote.errors, undefined);
  assert.equal(quote.data.checkoutQuote.discount, 15000);
  assert.equal(quote.data.checkoutQuote.total, 100000 - 15000 + quote.data.checkoutQuote.shipping);
  const orders = await Promise.all(
    [customer, other].map((target, index) =>
      gql(
        'mutation($input:CreateOrderInput!){createOrder(input:$input){id subtotal discount total}}',
        {
          input: {
            ...quoteInput,
            addressId: target.address.id,
            requestId: randomUUID(),
            expectedTotal: quote.data.checkoutQuote.total,
          },
        },
        sessions[index],
      ),
    ),
  );
  assert.equal(orders.filter((result) => result.data?.createOrder).length, 1);
  assert.equal(
    orders.filter((result) => result.errors?.[0]?.extensions?.code === 'INVALID_DISCOUNT').length,
    1,
  );
  assert.equal(
    (await db.discountCode.findUniqueOrThrow({ where: { id: coupon.id } })).usageCount,
    1,
  );
  const order = orders.find((result) => result.data?.createOrder).data.createOrder;
  const orderOwner = orders[0].data?.createOrder ? 0 : 1;
  const ticket = await gql(
    `mutation($input:TicketInput!){createTicket(input:$input){${ticketFields}}}`,
    {
      input: {
        subject: 'پیگیری بسته آزمون',
        body: 'زمان ارسال بسته را اعلام کنید.',
        orderId: order.id,
      },
    },
    sessions[orderOwner],
  );
  assert.equal(ticket.errors, undefined);
  const ticketId = ticket.data.createTicket.id;
  errorCode(
    await gql(
      `query($id:ID!){myTicket(id:$id){${ticketFields}}}`,
      { id: ticketId },
      sessions[1 - orderOwner],
    ),
    'NOT_FOUND',
  );
  errorCode(
    await gql(
      `mutation($input:TicketReplyInput!){replyTicket(input:$input){id}}`,
      { input: { id: ticketId, body: 'دسترسی غیرمجاز' } },
      sessions[1 - orderOwner],
    ),
    'NOT_FOUND',
  );
  const reply = await adminGql(
    `mutation($input:TicketReplyInput!){replyAdminTicket(input:$input){${ticketFields}}}`,
    { input: { id: ticketId, body: 'بسته فردا ارسال می‌شود.' } },
    staffSession.cookies,
  );
  assert.equal(reply.errors, undefined);
  assert.equal(reply.data.replyAdminTicket.messages.at(-1).fromSupport, true);
  const thread = await gql(
    `query($id:ID!){myTicket(id:$id){${ticketFields}}}`,
    { id: ticketId },
    sessions[orderOwner],
  );
  assert.equal(thread.data.myTicket.messages.length, 2);
  const changeStatus = `mutation($id:ID!,$status:TicketStatus!,$version:String!){setAdminTicketStatus(id:$id,status:$status,expectedUpdatedAt:$version){${ticketFields}}}`;
  errorCode(
    await adminGql(
      changeStatus,
      { id: ticketId, status: 'CLOSED', version: ticket.data.createTicket.updatedAt },
      staffSession.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  const closed = await adminGql(
    changeStatus,
    { id: ticketId, status: 'CLOSED', version: reply.data.replyAdminTicket.updatedAt },
    staffSession.cookies,
  );
  assert.equal(closed.errors, undefined);
  errorCode(
    await gql(
      'mutation($input:TicketReplyInput!){replyTicket(input:$input){id}}',
      { input: { id: ticketId, body: 'پیام بعد از بستن' } },
      sessions[orderOwner],
    ),
    'BAD_USER_INPUT',
  );
  const submit = `mutation($input:ReviewInput!){submitProductReview(input:$input){${reviewFields}}}`;
  const newReview = await gql(
    submit,
    { input: { productId: product.id, rating: 5, body: 'ارده بسیار خوش‌طعم است.' } },
    sessions[0],
  );
  assert.equal(newReview.errors, undefined);
  let review = newReview.data.submitProductReview;
  assert.equal(review.status, 'PENDING');
  const publicQuery =
    'query($productId:ID!){productReviews(productId:$productId){total items{id body authorName}}}';
  assert.equal((await gql(publicQuery, { productId: product.id })).data.productReviews.total, 0);
  const moderate = `mutation($id:ID!,$status:ReviewStatus!,$version:String!){moderateProductReview(id:$id,status:$status,expectedUpdatedAt:$version){${reviewFields}}}`;
  const approved = await adminGql(
    moderate,
    { id: review.id, status: 'APPROVED', version: review.updatedAt },
    staffSession.cookies,
  );
  assert.equal(approved.errors, undefined);
  assert.equal((await gql(publicQuery, { productId: product.id })).data.productReviews.total, 1);
  errorCode(
    await adminGql(
      moderate,
      { id: review.id, status: 'REJECTED', version: review.updatedAt },
      staffSession.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  const edited = await gql(
    submit,
    { input: { productId: product.id, rating: 4, body: 'نظر ویرایش‌شده نیازمند تأیید دوباره' } },
    sessions[0],
  );
  assert.equal(edited.data.submitProductReview.id, review.id);
  assert.equal((await gql(publicQuery, { productId: product.id })).data.productReviews.total, 0);
  await adminGql(
    moderate,
    { id: review.id, status: 'APPROVED', version: edited.data.submitProductReview.updatedAt },
    ownerSession.cookies,
  );
  await db.product.update({ where: { id: product.id }, data: { isActive: false } });
  assert.equal((await gql(publicQuery, { productId: product.id })).data.productReviews.total, 0);
  await db.product.update({ where: { id: product.id }, data: { isActive: true } });
  await db.user.update({
    where: { id: customer.user.id },
    data: { firstName: '=HYPERLINK("evil")', lastName: 'آزمون اکسل' },
  });
  const exported = await adminGql(
    'query($search:String){adminCustomerExport(search:$search){filename base64 count}}',
    { search: customer.user.phone },
    ownerSession.cookies,
  );
  assert.equal(exported.errors, undefined);
  assert.equal(exported.data.adminCustomerExport.count, 1);
  const persianPhone = customer.user.phone.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  const persianExport = await adminGql(
    'query($search:String){adminCustomerExport(search:$search){count}}',
    { search: persianPhone },
    ownerSession.cookies,
  );
  assert.equal(persianExport.data.adminCustomerExport.count, 1);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(exported.data.adminCustomerExport.base64, 'base64'));
  const sheet = workbook.worksheets[0];
  assert.equal(sheet.getCell('A2').value, customer.user.phone);
  assert.equal(sheet.getCell('A2').numFmt, '@');
  assert.equal(sheet.getCell('B2').value, '=HYPERLINK("evil")');
  assert.equal(sheet.getCell('B2').type, ExcelJS.ValueType.String);
  // Read operations authorize identity regardless of origin; mutation origins stay enforced.
  errorCode(
    await adminGql(
      'mutation($id:ID!,$isActive:Boolean!){setStaffActive(id:$id,isActive:$isActive){id}}',
      { id: staff.id, isActive: false },
      ownerSession.cookies,
      '192.0.2.1',
      origin,
    ),
    'FORBIDDEN',
  );
  const disabled = await adminGql(
    'mutation($id:ID!,$isActive:Boolean!){setStaffActive(id:$id,isActive:$isActive){isActive}}',
    { id: staff.id, isActive: false },
    ownerSession.cookies,
  );
  assert.equal(disabled.errors, undefined);
  errorCode(
    await adminGql('{adminProducts(input:{page:1}){total}}', {}, staffSession.cookies),
    'UNAUTHENTICATED',
  );
  errorCode(
    await adminGql('mutation{adminRefresh{accessToken}}', {}, staffSession.cookies),
    'UNAUTHENTICATED',
  );
  errorCode(await loginAdmin(staff), 'INVALID_CREDENTIALS');
  console.log(
    'Role enforcement, staff operations/revocation, atomic coupons, ticket ownership, review moderation and genuine XLSX export passed.',
  );
} finally {
  await db.supportTicket.deleteMany({
    where: { user: { phone: { in: (await import('./auth-harness.mjs')).phones } } },
  });
  await db.order.updateMany({
    where: { discountCodeId: { in: coupons } },
    data: { discountCodeId: null },
  });
  await db.discountCode.deleteMany({ where: { id: { in: coupons } } });
  await cleanupAdmin();
}
