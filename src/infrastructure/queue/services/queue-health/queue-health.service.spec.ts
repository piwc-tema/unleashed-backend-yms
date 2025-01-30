import { Test, TestingModule } from '@nestjs/testing';
import { QueueHealthService } from './queue-health.service';

describe('QueueHealthService', () => {
  let service: QueueHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueHealthService],
    }).compile();

    service = module.get<QueueHealthService>(QueueHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
