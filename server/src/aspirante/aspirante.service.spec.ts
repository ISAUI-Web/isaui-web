import { Test, TestingModule } from '@nestjs/testing';
import { AspiranteService } from './aspirante.service';

describe('AspiranteService', () => {
  let service: AspiranteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AspiranteService],
    }).compile();

    service = module.get<AspiranteService>(AspiranteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
