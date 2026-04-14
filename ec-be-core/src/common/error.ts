import { QueryFailedError } from 'typeorm';

/** this function transform typeorm QueryFailedError message into a human friendly by using regex to remove unnecessary characters  */
export const typeormError = (error: QueryFailedError): string => {
  const message: string = (error as any).detail;
  return message.replace(/Key|\(|\)|=/g, ' ');
};
