import { reconcilePayments, gatewayAvailable } from './service.js';
export function startPaymentWorker() {
  if (!gatewayAvailable()) return () => {};
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await reconcilePayments();
    } catch {
      console.error('Payment reconciliation will retry.');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void run(), 30000);
  timer.unref();
  void run();
  return () => clearInterval(timer);
}
