import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

import { createEnrollmentWithAddress, createLiveTicketType, createUser, createTicket, createRemoteTicketType, createNoHotelTicketType } from '../factories';
import { cleanDbHotel, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { TicketStatus } from '@prisma/client';
import { createHotel, createRoom } from '../factories/hotels-factory';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDbHotel();
});

const server = supertest(app);

describe("GET /hotels", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("When token is valid", () => {
        it("should respond with status 404 if there is no enrollment", async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should respond with status 404 if there is no ticket", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            await createLiveTicketType();

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })
        it("should respond with status 404 if there is no hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createLiveTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })
        describe("When data is valid", () => {
            it("should respond with status 402 if ticket is not paid", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createLiveTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
                const hotel = await createHotel();

                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with status 402 if ticket is remote", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createRemoteTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with status 402 if ticket doesnt include hotel", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createNoHotelTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with list of available hotels and status 200 if everything ok", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createLiveTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                await createHotel();
                await createHotel();

                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.OK);
                expect(response.body).toHaveLength(2)
                expect(response.body).toEqual(
                    expect.arrayContaining(
                        [expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            image: expect.any(String),
                            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        }
                        )]
                    )
                )
            })
        })
    })

})

describe("GET /hotels/:hotelId", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels/1');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe("When token is valid", () => {
        it("should respond with status 400 if there is no params", async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels/aaa').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        })
        it("should respond with status 404 if there is no enrollment", async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should respond with status 404 if there is no ticket", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            await createLiveTicketType();

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })
        it("should respond with status 404 if there is no hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createLiveTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })
        describe("when data is valid", () => {
            it("should respond with status 402 if ticket is not paid", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createLiveTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
                const hotel = await createHotel();

                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with status 402 if ticket is remote", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createRemoteTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with status 402 if ticket doesnt include hotel", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createNoHotelTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
            })
            it("should respond with the hotel info and rooms if everything ok", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createLiveTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();
                await createRoom(hotel.id)
                await createRoom(hotel.id)
                await createRoom(hotel.id)

                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

                expect(response.status).toEqual(httpStatus.OK);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        Rooms: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.any(Number),
                                name: expect.any(String),
                                capacity: expect.any(Number),
                                hotelId: expect.any(Number),
                                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                                updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            })
                        ])
                    }
                    )

                )
            })
        })
    })
})

