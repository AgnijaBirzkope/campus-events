import { Registration } from '../models/index.mjs';

export const registrationRepository = {
  findForEvent: (eventId) => Registration.findAll({ where: { eventId }, order: [['createdAt', 'ASC']] }),
  findByEmail: (eventId, email) => Registration.findOne({ where: { eventId, email } }),
  countForEvent: (eventId) => Registration.count({ where: { eventId } }),
  create: (data) => Registration.create(data),
  bulkCreate: (registrations) => Registration.bulkCreate(registrations)
};
