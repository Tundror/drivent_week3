import { prisma } from '@/config';

async function getHotels(){
    const hotels = await prisma.hotel.findMany()
    return hotels
}

const hotelRepository = {
    getHotels,
  };

export default hotelRepository