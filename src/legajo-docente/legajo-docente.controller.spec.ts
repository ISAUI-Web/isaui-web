import { Test, TestingModule } from '@nestjs/testing';
import { LegajoDocenteController } from './legajo-docente.controller';
import { LegajoDocenteService } from './legajo-docente.service';

describe('LegajoDocenteController', () => {
  let controller: LegajoDocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegajoDocenteController],
      providers: [LegajoDocenteService],
    }).compile();

    controller = module.get<LegajoDocenteController>(LegajoDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
