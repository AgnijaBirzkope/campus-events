import { Event } from '../models/index.mjs';

export const eventRepository = {
  findAll: (options = {}) => Event.findAll(options),
  findById: (id) => Event.findByPk(id),
  create: (data) => Event.create(data),
  deleteById: (id) => Event.destroy({ where: { id } }),
  bulkCreate: (events) => Event.bulkCreate(events)
};
