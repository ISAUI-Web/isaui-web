import { Test, TestingModule } from '@nestjs/testing';
import { PreinscripcionController } from './preinscripcion.controller';

describe('PreinscripcionController', () => {
  let controller: PreinscripcionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreinscripcionController],
    }).compile();

    controller = module.get<PreinscripcionController>(PreinscripcionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
