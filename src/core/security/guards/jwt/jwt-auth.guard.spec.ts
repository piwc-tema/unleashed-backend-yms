import { JwtAuthGuard } from './jwt-auth-guard.service';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
