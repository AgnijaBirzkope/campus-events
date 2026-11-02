import { registrationService } from '../services/registrationService.mjs';

export const registrationController = {
  list: async (req, res) => res.json(await registrationService.list(req.validated.params.id)),
  create: async (req, res) => {
    const registration = await registrationService.register(req.validated.params.id, req.validated.body);
    res.status(201).json(registration);
  }
};
