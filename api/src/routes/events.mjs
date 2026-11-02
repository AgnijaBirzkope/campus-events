import { Router } from 'express';
import { eventController } from '../controllers/eventController.mjs';
import { registrationController } from '../controllers/registrationController.mjs';
import { validate } from '../middleware/validate.mjs';
import { createEventSchema, idSchema, registrationSchema, updateEventSchema } from '../validation/schemas.mjs';

export const eventsRouter = Router();

eventsRouter.get('/', eventController.list);
eventsRouter.post('/', validate(createEventSchema, 'body'), eventController.create);
eventsRouter.get('/:id', validate(idSchema, 'params'), eventController.get);
eventsRouter.patch('/:id', validate(idSchema, 'params'), validate(updateEventSchema, 'body'), eventController.update);
eventsRouter.delete('/:id', validate(idSchema, 'params'), eventController.remove);
eventsRouter.get('/:id/registrations', validate(idSchema, 'params'), registrationController.list);
eventsRouter.post('/:id/registrations', validate(idSchema, 'params'), validate(registrationSchema, 'body'), registrationController.create);
