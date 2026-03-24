import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns service health', () => {
    const controller = new AppController();

    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'server',
    });
  });
});
