import {Schema, model} from 'mongoose';

const bookGenreSchema = new Schema({
    name: String,
}, {timestamps: false, versionKey: false});

bookGenreSchema.index('name', {unique: true});

export const BookGenre = model('BookGenre', bookGenreSchema);