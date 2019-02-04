import { Request, Response } from 'express';

export default (err: Error, req: Request, res: Response) => {
    console.error(err);
    res.status(500).send('Server Error');
}