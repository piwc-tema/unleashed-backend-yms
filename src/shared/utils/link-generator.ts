import { v4 as uuid } from 'uuid';

const generateRegistrationLink = (id: string = uuid()): string => {
  return `http://localhost:4200/form/${id}`;
};

export default generateRegistrationLink;
