import {IBookGenre} from "./book.genre";
import {IUser} from "./user";

export interface IReview {
    _id: string;
    user: IUser;
    rating: number;
    status: string;
    description: string;
}

export interface IBook {
    _id: string;
    name: string;
    description: string;
    genre: IBookGenre;
    reviews: Array<IReview>
}
