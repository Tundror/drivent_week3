import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequired',
    message: 'Payment for the ticket required!',
  };
}