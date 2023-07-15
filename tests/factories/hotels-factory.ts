import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel() {
    return prisma.hotel.create({
      data: {
        name: faker.name.findName(),
        image: faker.image.imageUrl(),
        updatedAt: new Date()
      },
    });
  }

export async function createRoom(hotelId: number) {
    return prisma.room.create({
        data: {
            name: faker.random.numeric(3),
            capacity: parseInt(faker.random.numeric(1)),
            hotelId,
            updatedAt: new Date(),
        },
    });
}