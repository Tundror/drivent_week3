import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels(){
    const hotels = await hotelRepository.getHotels();
    if (!hotels) throw notFoundError();
  
    return hotels;
  }

const hotelService = {getHotels}
export default hotelService