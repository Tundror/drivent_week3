import { prisma } from '@/config';

async function getHotels(){
    const hotels = await prisma.hotel.findMany()
    return hotels
}

async function getHotelRooms(hotelId: number){
    const rooms = await prisma.room.findMany({
        where:{
            hotelId
        }
    })
    return rooms
}

async function getHotel(hotelId: number){
    const hotel = await prisma.hotel.findFirst({
        where:{
            id: hotelId
        },
        include:{
            Rooms: true
        }
    })
    return hotel
}

const hotelRepository = {
    getHotels,
    getHotelRooms,
    getHotel
  };

export default hotelRepository