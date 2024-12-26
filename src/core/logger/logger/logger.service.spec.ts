import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Create a mock for the Winston logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      // Include other methods Winston logger may have, if needed
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an info message', () => {
    service.log('Test info message', 'TestContext');
    expect(mockLogger.info).toHaveBeenCalledWith('Test info message', {
      context: 'TestContext',
    });
  });

  it('should log an error message', () => {
    service.error('Test error message', 'Test trace', 'TestContext');
    expect(mockLogger.error).toHaveBeenCalledWith('Test error message', {
      trace: 'Test trace',
      context: 'TestContext',
    });
  });

  it('should log a warning message', () => {
    service.warn('Test warning message', 'TestContext');
    expect(mockLogger.warn).toHaveBeenCalledWith('Test warning message', {
      context: 'TestContext',
    });
  });

  it('should log a debug message', () => {
    service.debug('Test debug message', 'TestContext');
    expect(mockLogger.debug).toHaveBeenCalledWith('Test debug message', {
      context: 'TestContext',
    });
  });

  it('should log a verbose message', () => {
    service.verbose('Test verbose message', 'TestContext');
    expect(mockLogger.verbose).toHaveBeenCalledWith('Test verbose message', {
      context: 'TestContext',
    });
  });

  it('should use the default context if none is provided', () => {
    service.setDefaultContext('DefaultContext');
    service.log('Test info message');
    expect(mockLogger.info).toHaveBeenCalledWith('Test info message', {
      context: 'DefaultContext',
    });
  });
});
