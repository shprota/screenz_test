import Controller from "../interfaces/controller";
import {NextFunction, Router, Request, Response} from "express";
import {Environment} from "../interfaces/env";
import {checkAuth} from "../middleware/auth";
import {BookGenre} from "../models/book.genre";

export default class BookGenreController implements Controller {
    public path = '/genres';
    public router = Router();

    // noinspection JSUnusedLocalSymbols
    constructor(private env: Environment) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, BookGenreController.listGenres);
        this.router.post(`${this.path}/`, checkAuth, BookGenreController.checkPermissions('admin'), BookGenreController.createGenre);
        this.router.put(`${this.path}/:id`, checkAuth, BookGenreController.checkPermissions('admin'), BookGenreController.updateGenre);
        this.router.patch(`${this.path}/:id`, checkAuth, BookGenreController.checkPermissions('admin'), BookGenreController.updateGenre);
        this.router.delete(`${this.path}/:id`, checkAuth, BookGenreController.checkPermissions('admin'), BookGenreController.deleteGenre);
    }

    private static checkPermissions(permission: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.user.role !== permission) {
                return res.status(403).end();
            }
            next();
        }
    }

    private static async listGenres(req: Request, res: Response, next: NextFunction) {
        try {
            return res.json(await BookGenre.find({}))
        } catch (e) {
            next(e);
        }
    }

    private static async createGenre(req: Request, res: Response, next: NextFunction) {
        try {
            return res.json((await new BookGenre(req.body).save()).toJSON());
        } catch (e) {
            next(e);
        }
    }

    private static async updateGenre(req: Request, res: Response, next: NextFunction) {
        try {
            const genre = await BookGenre.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
            if (!genre) {
                return res.status(400).end();
            }
            return res.json(genre.toJSON());
        } catch (e) {
            next(e);
        }
    }

    private static async deleteGenre(req: Request, res: Response, next: NextFunction) {
        try {
            const genre = await BookGenre.findByIdAndDelete(req.params.id);
            if (!genre) {
                return res.status(400).end();
            }
            // TODO: Handle orphaned books?
            return res.json({success: true});
        } catch (e) {
            next(e);
        }
    }
}
