import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotel-service';

export async function getHotels(req: AuthenticatedRequest, res: Response){
    const userId = req.userId
    try {
        const hotels = await hotelService.getHotels(userId);
        return res.status(httpStatus.OK).send(hotels);
      } catch (e) {
        return res.sendStatus(httpStatus.NO_CONTENT);
      }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response){
    const userId = req.userId
    const hotelId = parseInt(req.params.hotelId)
    try {
        const hotel = await hotelService.getHotelRooms(hotelId, userId);
        return res.status(httpStatus.OK).send(hotel);
      } catch (e) {
        return res.sendStatus(httpStatus.NO_CONTENT);
      }
}