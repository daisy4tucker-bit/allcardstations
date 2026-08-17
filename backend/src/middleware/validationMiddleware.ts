import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors.js';

export function validateRegistration(req: Request, res: Response, next: NextFunction): void {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !firstName.trim()) {
    return next(new BadRequestError('First name is required.'));
  }
  if (!lastName || !lastName.trim()) {
    return next(new BadRequestError('Last name is required.'));
  }
  if (!email || !email.trim()) {
    return next(new BadRequestError('Email address is required.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return next(new BadRequestError('Please provide a valid email address.'));
  }

  if (!password || password.length < 6) {
    return next(new BadRequestError('Password must be at least 6 characters long.'));
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return next(new BadRequestError('Passwords do not match.'));
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(new BadRequestError('Email address is required.'));
  }
  if (!password) {
    return next(new BadRequestError('Password is required.'));
  }

  next();
}

export function validateRecipient(req: Request, res: Response, next: NextFunction): void {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return next(new BadRequestError('Recipient name is required.'));
  }
  next();
}
