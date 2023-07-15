import { prisma } from "@/config";
import { notFoundError, paymentRequiredError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import { checkHotelErrors } from "@/utils/hotel-utils";


async function getHotels(userId: number) {

    await checkHotelErrors(userId)

    const hotels = await hotelRepository.getHotels();
    if (!hotels) throw notFoundError();
    if (hotels.length === 0) throw notFoundError();
    return hotels;
}

async function getHotelRooms(hotelId: number, userId: number){
    await checkHotelErrors(userId)

    const hotel = await hotelRepository.getHotel(hotelId)
    if(!hotel) throw notFoundError();

    return hotel
}

const hotelService = { getHotels, getHotelRooms }
export default hotelService