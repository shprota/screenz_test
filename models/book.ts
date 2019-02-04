import {Schema, model} from 'mongoose';

const bookReviewSchema = new Schema({
    user: {type: 'ObjectId', ref: 'User', required: true},
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Submitted', 'Accepted', 'Rejected'],
    },
    description: {type: String, required: true},
});

const bookSchema = new Schema({
    name: String,
    description: String,
    genre: {type: 'ObjectId', ref: 'BookGenre'},
    reviews: [bookReviewSchema]
}, {timestamps: true, versionKey: false});

export const Book = model('Book', bookSchema);