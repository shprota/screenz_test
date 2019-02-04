import mongoose from 'mongoose';

export interface IUser {
    username: string;
    password?: string;
    role?: string;
    createdAt?: boolean | string;
    updatedAt?: boolean | string;
}

export interface IUserDocument extends IUser, mongoose.Document{
    comparePassword(candidatePassword: string, cb: (err: Error, res: any) => void): void;
}