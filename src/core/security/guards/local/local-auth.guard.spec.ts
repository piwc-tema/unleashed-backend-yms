import { LocalAuthGuard } from './local-auth-guard.service';

describe('LocalAuthGuard', () => {
  it('should be defined', () => {
    expect(new LocalAuthGuard()).toBeDefined();
  });
});
