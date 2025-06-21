import { Test, TestingModule } from '@nestjs/testing';
import { PreinscripcionService } from './preinscripcion.service';

describe('PreinscripcionService', () => {
  let service: PreinscripcionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreinscripcionService],
    }).compile();

    service = module.get<PreinscripcionService>(PreinscripcionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
