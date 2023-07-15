import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotel-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId
  const hotels = await hotelService.getHotels(userId);
  return res.status(httpStatus.OK).send(hotels);
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId
  const hotelId = parseInt(req.params.hotelId)
  const hotel = await hotelService.getHotelRooms(hotelId, userId);
  return res.status(httpStatus.OK).send(hotel);
}