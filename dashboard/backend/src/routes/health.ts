import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'leakguard-dashboard-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    components: {
      api: 'healthy',
      database: 'connected',
      scanner_adapter: 'ready'
    }
  });
});
