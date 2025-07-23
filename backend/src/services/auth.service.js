import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from '../utils/generateToken.js';

export const registerService = async ({ name, email, password, phone, type }) => {
  const hash = await bcrypt.hash(password, 10);
  const userFind = await prisma.investor.findUnique({ where: { email } });
  if (userFind) {
    throw new Error('User Already Exist');
  }

  const user = await prisma.investor.create({
    data: {
      name,
      email,
      phone,
      password: hash,
      type
    },
  });
  const token = jwt(user.id);
  return { token, user: { id: user.id, email: user.email, name: user.name, type: user.type } };
};


export const loginService = async ({ email, password }) => {
  const user = await prisma.investor.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }
  const token = jwt(user.id);
  return { token, user: { id: user.id, name: user.name, email: user.email } };
};