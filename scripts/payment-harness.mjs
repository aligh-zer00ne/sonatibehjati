import assert from 'node:assert/strict';
import { createServer } from 'node:http';
export const bankRecords = new Map();
export const bankControl = { tokenError: false, tokenOutage: false, tokenDelay: false };
export const bank = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks));
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/OnlinePG/OnlinePG') {
    if (bankControl.tokenError) {
      res.end(JSON.stringify({ status: -1, errorCode: '8' }));
      return;
    }
    if (bankControl.tokenOutage) {
      res.statusCode = 503;
      res.end('{}');
      return;
    }
    if (bankControl.tokenDelay) await new Promise((resolve) => setTimeout(resolve, 100));
    bankRecords.set(input.ResNum, { ...input, verifyCalls: 0, reverseCalls: 0 });
    res.end(JSON.stringify({ status: 1, token: 'token-' + input.ResNum }));
    return;
  }
  const record = [...bankRecords.values()].find((p) => 'ref-' + p.ResNum === input.RefNum);
  if (!record) {
    res.end(JSON.stringify({ ResultCode: -2, Success: false }));
    return;
  }
  assert.equal(input.TxnRandomSessionKey, record.TxnRandomSessionKey);
  if (req.url.endsWith('/ReverseTransaction')) {
    record.reverseCalls++;
    if (record.reverseOutage) {
      res.statusCode = 503;
      res.end('{}');
      return;
    }
    record.reversed = true;
    res.end(JSON.stringify({ ResultCode: 0, Success: true }));
    return;
  }
  record.verifyCalls++;
  if (record.outage) {
    res.statusCode = 503;
    res.end('{}');
    return;
  }
  if (record.incomplete) {
    res.end(JSON.stringify({ ResultCode: 0, Success: true }));
    return;
  }
  const detail = {
    RefNum: input.RefNum,
    TerminalNumber: record.wrongTerminal ? 999 : Number(record.TerminalId),
    OrginalAmount: record.wrongAmount ?? record.Amount,
    RRN: '123456',
    StraceNo: '789',
  };
  if (record.forceCode !== undefined) {
    res.end(
      JSON.stringify({ ResultCode: record.forceCode, Success: false, TransactionDetail: detail }),
    );
    return;
  }
  res.end(
    JSON.stringify({
      ResultCode: record.verifyCalls > 1 ? 2 : 0,
      Success: record.verifyCalls === 1,
      TransactionDetail: detail,
    }),
  );
});
await new Promise((resolve) => bank.listen(0, '127.0.0.1', resolve));
process.env.NODE_ENV = 'test';
process.env.PAYMENT_PROVIDER = 'sep';
process.env.SEP_TERMINAL_ID = '12345678';
process.env.SEP_CALLBACK_ORIGIN = 'http://localhost:3004';
process.env.SEP_TEST_BASE_URL = `http://127.0.0.1:${bank.address().port}`;
