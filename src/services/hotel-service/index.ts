import { prisma } from "@/config";
import { notFoundError, paymentRequiredError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";


async function getHotels(userId: number) {

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId
        }
    })
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await prisma.ticket.findFirst({
        where:{
            enrollmentId: enrollment.id
        },
        include:{
            TicketType: true
        }  
    });

    if(!ticket) throw notFoundError();
    
    if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw paymentRequiredError();
    }

    const hotels = await hotelRepository.getHotels();
    if (!hotels) throw notFoundError();

    return hotels;
}

const hotelService = { getHotels }
export default hotelService