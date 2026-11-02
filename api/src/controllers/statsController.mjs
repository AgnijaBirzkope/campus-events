import { statsService } from '../services/statsService.mjs';

export const statsController = { list: async (_req, res) => res.json(await statsService.list()) };
