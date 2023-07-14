import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getPaymentByTicketId, paymentProcess } from '@/controllers';
import { getHotelRooms, getHotels } from '@/controllers/hotel-controller';

const hotelRouter = Router();

hotelRouter.get("/", authenticateToken, getHotels)
hotelRouter.get("/:hotelId", authenticateToken, getHotelRooms)

export { hotelRouter };