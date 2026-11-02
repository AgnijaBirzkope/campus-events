import { notFound } from '../errors/AppError.mjs';
import { eventRepository } from '../repositories/eventRepository.mjs';
import { registrationRepository } from '../repositories/registrationRepository.mjs';
import { cache } from './cacheService.mjs';

const asJson = (model) => model.toJSON();

export const eventService = {
  list() {
    return cache.getOrSet('events', async () => (await eventRepository.findAll({ order: [['startsAt', 'ASC']] })).map(asJson));
  },

  get(id) {
    return cache.getOrSet(`event:${id}`, async () => {
      const event = await eventRepository.findById(id);
      if (!event) throw notFound(id);
      const registered = await registrationRepository.countForEvent(id);
      return { ...asJson(event), registered, spotsLeft: Math.max(event.capacity - registered, 0) };
    });
  },

  async create(data) {
    const event = await eventRepository.create(data);
    cache.clear();
    return event;
  },

  async update(id, data) {
    const event = await eventRepository.findById(id);
    if (!event) throw notFound(id);
    await event.update(data);
    cache.clear();
    return event;
  },

  async remove(id) {
    if ((await eventRepository.deleteById(id)) === 0) throw notFound(id);
    cache.clear();
  }
};
