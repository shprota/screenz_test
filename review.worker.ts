import {Book} from "./models/book";

require('source-map-support').install();
import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import mongoose from 'mongoose';

// @ts-ignore
import {Consumer} from "redis-smq";
import bluebird from "bluebird";

dotenv.load({path: '.env.example'});
const env = validateEnv();
import {RedisSmqConfig} from "./config/redis-smq";

import rp from "request-promise";

mongoose.Promise = bluebird;

class ReviewConsumer extends Consumer {

    constructor(config: any) {
        super(config);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    consume(message: any, cb: any) {
        this.processReview(message)
            .then(cb)
            .catch(cb);
    }

    // noinspection JSMethodCanBeStatic
    async processReview(message: any) {

        // In the real life the reviews must be in a separate table
        // But for a test task an embedded array will do just fine.
        // Besides, can play with aggregation framework to retrieve
        // only the desired review.

        const book = await Book.findById(message.bookId);
        const review = book.reviews.id(message.reviewId);
        console.log(review.toJSON());
        // Check for profanity with http://www.purgomalum.com/ service
        const resp = await rp.get({
            url: 'https://www.purgomalum.com/service/containsprofanity',
            qs: {
                text: review.description
            }
        });
        console.log("Profanity: ", resp);
        if (resp === 'true') {
            review.status = 'Rejected';
            await book.save();
        }
        return;
    }
}

// @ts-ignore
ReviewConsumer.queueName = 'reviews';
const consumer = new ReviewConsumer(RedisSmqConfig);

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

mongoose.connection.on('error', (err: any) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', '✗');
    process.exit();
});
mongoose.connect(env.MONGODB_URI || '')
    .then(() => {
        // @ts-ignore
        consumer.run();
    });

