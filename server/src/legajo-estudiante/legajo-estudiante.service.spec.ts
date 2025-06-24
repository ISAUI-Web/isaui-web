import { Test, TestingModule } from '@nestjs/testing';
import { LegajoEstudianteService } from './legajo-estudiante.service';

describe('LegajoEstudianteService', () => {
  let service: LegajoEstudianteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegajoEstudianteService],
    }).compile();

    service = module.get<LegajoEstudianteService>(LegajoEstudianteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
