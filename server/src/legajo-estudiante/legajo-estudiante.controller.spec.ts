import { Test, TestingModule } from '@nestjs/testing';
import { LegajoEstudianteController } from './legajo-estudiante.controller';
import { LegajoEstudianteService } from './legajo-estudiante.service';

describe('LegajoEstudianteController', () => {
  let controller: LegajoEstudianteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegajoEstudianteController],
      providers: [LegajoEstudianteService],
    }).compile();

    controller = module.get<LegajoEstudianteController>(LegajoEstudianteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
