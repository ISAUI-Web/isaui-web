import { Test, TestingModule } from '@nestjs/testing';
import { AspiranteController } from './aspirante.controller';

describe('AspiranteController', () => {
  let controller: AspiranteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AspiranteController],
    }).compile();

    controller = module.get<AspiranteController>(AspiranteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
