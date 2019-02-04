import Controller from "../interfaces/controller";
import {NextFunction, Router, Request, Response} from "express";
import {Environment} from "../interfaces/env";
import {checkAuth} from "../middleware/auth";
import {Book} from "../models/book";

export default class BookController implements Controller {
    public path = '/s';
    public router = Router();

    // noinspection JSUnusedLocalSymbols
    constructor(private env: Environment) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, BookController.lists);
        this.router.post(`${this.path}/`, checkAuth, BookController.checkPermissions('admin'), BookController.createBook);
        this.router.put(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.updateBook);
        this.router.patch(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.updateBook);
        this.router.delete(`${this.path}/:id`, checkAuth, BookController.checkPermissions('admin'), BookController.deleteBook);
    }

    private static checkPermissions(permission: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.user.role !== permission) {
                return res.status(403).end();
            }
            next();
        }
    }

    private static async lists(req: Request, res: Response, next: NextFunction) {
        try {
            return res.json(await Book.find({}))
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
            return res.json(book.toJSON());
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
}
