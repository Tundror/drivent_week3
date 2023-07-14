import { prisma } from "@/config";
import { notFoundError, paymentRequiredError } from "@/errors";

export async function checkHotelErrors(userId: number){
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
}