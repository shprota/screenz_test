import express, {NextFunction} from 'express';
import Controller from "../interfaces/controller";
import {checkAuth} from "../middleware/auth";
import {User} from "../models/user";
import {Environment} from "../interfaces/env";
import {IUserDocument} from "../interfaces/user";


export default class UserController implements Controller {
    public path = '/user';
    public router = express.Router();

    // noinspection JSUnusedLocalSymbols
    constructor(private env: Environment) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, checkAuth, UserController.listUsers);
        this.router.post(`${this.path}/`, checkAuth, UserController.checkPermissions('admin'), UserController.createUser);
        this.router.put(`${this.path}/:id`, checkAuth, UserController.checkPermissions('admin'), UserController.updateUser);
        this.router.patch(`${this.path}/:id`, checkAuth, UserController.checkPermissions('admin'), UserController.updateUser);
        this.router.delete(`${this.path}/:id`, checkAuth, UserController.checkPermissions('admin'), UserController.deleteUser);
    }

    private static checkPermissions(permission: string) {
        return (req: express.Request, res: express.Response, next: NextFunction) => {
            if (req.user.role !== permission) {
                return res.status(403).end();
            }
            next();
        }
    }

    private static async listUsers(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            let users = await User.find({});
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }


    private static async createUser(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            let userData: IUserDocument = new User(req.body);
            const user = await userData.save();
            return res.json(user.toJSON());
        } catch (e) {
            next(e);
        }
    }

    private static async updateUser(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const user = await User.findOneAndUpdate(
                {
                    company: req.user.company,
                    _id: req.params.id
                },
                {$set: req.body},
                {new: true}
            );
            if (!user) {
                return res.status(403).end();
            }
            return res.json(user.toJSON());
        } catch (e) {
            next(e);
        }
    }

    private static async deleteUser(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const id = req.params.id;
            console.log('deleting user ', id, req.user._id.toString(), typeof (req.user._id.toString()));
            if (req.user._id.equals(id)) {
                // Disallow deleting myself
                return res.status(403).end();
            }
            await User.findOneAndRemove({company: req.user.company, _id: id});
            return res.status(200).end();
        } catch (e) {
            next(e);
        }
    }
}