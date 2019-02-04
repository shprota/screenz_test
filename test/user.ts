import {expect, should} from "chai";
import sinon from "sinon";
import sinon_mongoose from "sinon-mongoose";
import mongoose from "mongoose";
import {MongoError} from "mongodb";
import {IUserDocument} from "../interfaces/user";

import {User} from "../models/user";

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
should();
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', '✗');
    process.exit();
});
describe('User Model', () => {
    before(done => {
        mongoose.connect('mongodb://localhost:27017/stest');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function () {
            console.log('We are connected to test database!');
            done();
        });
    });
    it('should create a new user', (done) => {
        const user = new User({username: 'test', email: 'test@gmail.com', password: 'root123'});

        user.save((err: Error) => {
            expect(err).to.be.null;
            done();
        });
    });

    it('should fail on invalid email', (done) => {
        const user = new User({email: 'test_gmail.com', password: 'root'});
        user.validate((err: any) => {
            err.errors.should.have.property('email');
            done();
        });
    });

    it('should return error if user is not created', (done) => {
        const UserMock = sinon.mock(new User({email: 'test@gmail.com', password: 'root'}));
        // @ts-ignore
        const user = UserMock.object;
        const expectedError = {
            name: 'ValidationError'
        };

        UserMock
            .expects('save')
            .yields(expectedError);

        user.save((err: any, result: any) => {
            UserMock.verify();
            UserMock.restore();
            expect(err.name).to.equal('ValidationError');
            expect(result).to.be.undefined;
            done();
        });
    });

    it('should not create a user with the unique username', (done) => {
        const user = new User({username: 'test', email: 'Test@gmail.com', password: 'root123'});
        user.save((err: any, result: IUserDocument) => {
            expect(err).to.be.not.null;
            expect(err.name).to.equal('MongoError');
            expect(result).to.be.undefined;
            done();
        });
    });

    it('should find user by username', (done) => {
        User.findOne({email: 'Test@gmAil.com'}, (err: any, result: IUserDocument) => {
            expect(result.username).to.equal('test@gmail.com');
            done();
        });
    });

    it('should match password', done => {
        User.findOne({email: 'test@gmail.com'}, (err: any, user: IUserDocument) => {
            user.comparePassword('root123', (err: any, match) => {
                expect(err).to.be.null;
                expect(match).to.be.true;
                done();
            });
        });
    });

    it('should not match wrong password', done => {
        User.findOne({email: 'test@gmail.com'}, (err: any, user: IUserDocument) => {
            user.comparePassword('root124', (err, match) => {
                expect(err).to.be.null;
                expect(match).to.be.false;
                done();
            });
        });
    });


    it('should remove user by username', (done) => {
        const userMock = sinon.mock(User);
        const expectedResult = {
            nRemoved: 1
        };

        userMock
            .expects('remove')
            .withArgs({username: 'test'})
            .yields(null, expectedResult);

        User.remove({username: 'test'}, (err: any) => {
            userMock.verify();
            userMock.restore();
            expect(err).to.be.null;
            // expect(result.nRemoved).to.equal(1);
            done();
        });
    });


    after(function (done) {
        mongoose.connection.db.dropDatabase(function () {
            mongoose.connection.close(done);
        });
    });
});


