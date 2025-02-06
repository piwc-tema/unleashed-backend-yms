import { v4 as uuid } from 'uuid';
import * as process from 'process';

const generateRegistrationLink = (id: string = uuid()): string => {
  return `${process.env.APP_FRONTEND_URL}/forms/${id}`;
};

export default generateRegistrationLink;
