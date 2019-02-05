import Controller from "../interfaces/controller";
import {NextFunction, Router, Request, Response} from "express";
import {Environment} from "../interfaces/env";
import {checkAuth} from "../middleware/auth";
import {Book} from "../models/book";
import {IReview} from "../interfaces/book";
// noinspection TypeScriptCheckImport
// @ts-ignore
import {Message, Producer} from 'redis-smq';

export default class BookController implements Controller {
    public path = '/books';
    public router = Router();
    private producer: Producer;

    constructor(private env: Environment) {
        // Require config here because need env to load before
        const {RedisSmqConfig} = require("../config/redis-smq");
        this.producer = new Producer('reviews', RedisSmqConfig);
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, BookController.lists);
        this.router.post(`${this.path}/`, checkAuth, BookController.checkPermissions('admin'), BookController.createBook);
        this.router.put(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.updateBook);
        this.router.patch(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.updateBook);
        this.router.delete(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.deleteBook);

        this.router.post(`${this.path}/review/:id`, checkAuth, BookController.checkPermissions(['client', 'admin']), this.addReview.bind(this));
    }

    private static checkPermissions(permission: any) {
        if (!Array.isArray(permission)) {
            permission = [permission];
        }
        return (req: Request, res: Response, next: NextFunction) => {
            if (!permission.includes(req.user.role)) {
                return res.status(403).end();
            }
            next();
        }
    }

    private static async lists(req: Request, res: Response, next: NextFunction) {
        try {
            return res.json(await Book.find({}).populate("genre"));
        } catch (e) {
            next(e);
        }
    }

    private static async createBook(req: Request, res: Response, next: NextFunction) {
        try {
            return res.json((await new Book(req.body).save()).toJSON());
        } catch (e) {
            next(e);
        }
    }

    private static async updateBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book = await Book.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
            if (!book) {
                return res.status(400).end();
            }
            return res.json({success: true});
        } catch (e) {
            next(e);
        }
    }

    private static async deleteBook(req: Request, res: Response, next: NextFunction) {
        try {
            const book = await Book.findByIdAndDelete(req.params.id);
            if (!book) {
                return res.status(400).end();
            }
            // TODO: Handle orphaned books?
            return res.json({success: true});
        } catch (e) {
            next(e);
        }
    }

    private async addReview(req: Request, res: Response, next: NextFunction) {
        try {
            const review: IReview = req.body;
            const book = await Book.findById(req.params.id);
            if (!book) {
                return res.status(400).end();
            }
            review.user = req.user._id;
            review.status = 'Submitted';
            book.reviews.unshift(review);

            const message = new Message();
            message
                .setBody({bookId: book._id, reviewId: book.reviews[0]._id})
                .setTTL(3600000);

            await book.save();

            await new Promise((resolve, reject) => {
                this.producer.produceMessage(message, (err: any) => {
                    if (err) return reject(err);
                    return resolve();
                })
            });

            return res.json({success: true});
        } catch (e) {
            next(e);
        }
    }
}
