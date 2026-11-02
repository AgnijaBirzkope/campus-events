import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { registrationService } from '../../src/services/registrationService.mjs';
import { createTestApp, validEvent } from '../helpers/testApp.mjs';

describe('Caching and mail resilience', () => {
  let app;

  beforeEach(async () => {
    ({ app } = await createTestApp());
  });

  it('invalidates cached event details after a registration', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 2 }));
    const url = `/api/events/${created.body.id}`;
    assert.equal((await request(app).get(url)).body.spotsLeft, 2);

    await request(app).post(`${url}/registrations`).send({ name: 'Ada', email: 'ada@example.com' });

    assert.equal((await request(app).get(url)).body.spotsLeft, 1);
  });

  it('keeps a registration when the mail provider fails', async () => {
    const created = await request(app).post('/api/events').send(validEvent());
    const unavailableMailer = {
      sendRegistrationConfirmation: async () => { throw new Error('SMTP offline'); }
    };

    const registration = await registrationService.register(
      created.body.id,
      { name: 'Ada', email: 'ada@example.com' },
      unavailableMailer
    );
    const stored = await request(app).get(`/api/events/${created.body.id}/registrations`);

    assert.equal(registration.email, 'ada@example.com');
    assert.deepEqual(stored.body.map((item) => item.email), ['ada@example.com']);
  });

  it('rejects another registration once capacity is reached', async () => {
    const created = await request(app).post('/api/events').send(validEvent({ capacity: 1 }));
    const url = `/api/events/${created.body.id}/registrations`;
    await request(app).post(url).send({ name: 'Ada', email: 'ada@example.com' });

    const response = await request(app).post(url).send({ name: 'Grace', email: 'grace@example.com' });

    assert.equal(response.status, 409);
    assert.equal(response.body.error.message, 'Event is full');
  });
});
