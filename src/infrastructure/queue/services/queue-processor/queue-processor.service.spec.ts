import { Test, TestingModule } from '@nestjs/testing';
import { QueueProcessorService } from './queue-processor.service';

describe('QueueProcessorService', () => {
  let service: QueueProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueProcessorService],
    }).compile();

    service = module.get<QueueProcessorService>(QueueProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
