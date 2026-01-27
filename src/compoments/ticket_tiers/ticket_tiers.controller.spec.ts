import { Test, TestingModule } from '@nestjs/testing';
import { TicketTiersController } from './ticket_tiers.controller';
import { TicketTiersService } from './ticket_tiers.service';

describe('TicketTiersController', () => {
  let controller: TicketTiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTiersController],
      providers: [TicketTiersService],
    }).compile();

    controller = module.get<TicketTiersController>(TicketTiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
