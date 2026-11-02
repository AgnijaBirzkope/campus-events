import { eventRepository } from '../repositories/eventRepository.mjs';
import { registrationRepository } from '../repositories/registrationRepository.mjs';
import { cache } from './cacheService.mjs';

export const statsService = {
  list() {
    return cache.getOrSet('stats', async () => {
      const events = await eventRepository.findAll();
      return Promise.all(events.map(async (event) => {
        const registered = await registrationRepository.countForEvent(event.id);
        const status = registered >= event.capacity ? 'full' : new Date(event.startsAt) < new Date() ? 'past' : 'open';
        return { id: event.id, title: event.title, registered, capacity: event.capacity, occupancy: `${Math.round((registered / event.capacity) * 100)}%`, status };
      }));
    });
  }
};
