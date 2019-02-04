import {IBookGenre} from "./book.genre";

export interface IBook {
    _id: string;
    name: string;
    description: string;
    genre: IBookGenre;
}
