import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getPaymentByTicketId, paymentProcess } from '@/controllers';
import { getHotels } from '@/controllers/hotel-controller';

const hotelRouter = Router();

hotelRouter.get("/", authenticateToken, getHotels)

export { hotelRouter };