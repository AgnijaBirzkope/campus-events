import { conflict, notFound } from '../errors/AppError.mjs';
import { logger } from '../config/logger.mjs';
import { eventRepository } from '../repositories/eventRepository.mjs';
import { registrationRepository } from '../repositories/registrationRepository.mjs';
import { cache } from './cacheService.mjs';
import { mailService } from './mailService.mjs';

export const registrationService = {
  async list(eventId) {
    return cache.getOrSet(`registrations:${eventId}`, async () => {
      if (!(await eventRepository.findById(eventId))) throw notFound(eventId);
      return (await registrationRepository.findForEvent(eventId)).map((registration) => registration.toJSON());
    });
  },

  async register(eventId, data, sender = mailService) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw notFound(eventId);
    if (await registrationRepository.findByEmail(eventId, data.email)) {
      throw conflict(`${data.email} is already registered for this event`);
    }
    if ((await registrationRepository.countForEvent(eventId)) >= event.capacity) {
      throw conflict('Event is full');
    }

    const registration = await registrationRepository.create({ eventId, ...data });
    cache.clear();

    try {
      await sender.sendRegistrationConfirmation(registration, event);
    } catch (error) {
      // Registration is the source of truth: an unavailable mail provider must not roll it back.
      logger.error('Registration confirmation email failed', { registrationId: registration.id, message: error.message });
    }
    return registration;
  }
};
