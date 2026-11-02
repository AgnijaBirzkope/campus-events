import { eventService } from '../services/eventService.mjs';

export const eventController = {
  list: async (_req, res) => res.json(await eventService.list()),
  get: async (req, res) => res.json(await eventService.get(req.validated.params.id)),
  create: async (req, res) => {
    const event = await eventService.create(req.validated.body);
    res.status(201).location(`/api/events/${event.id}`).json(event);
  },
  update: async (req, res) => res.json(await eventService.update(req.validated.params.id, req.validated.body)),
  remove: async (req, res) => {
    await eventService.remove(req.validated.params.id);
    res.status(204).send();
  }
};
