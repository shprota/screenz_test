import bcrypt from "bcrypt-nodejs";
import {Schema, model, Model} from "mongoose";
import {IUser, IUserDocument} from "../interfaces/user";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: String,

}, {timestamps: true});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.get('password'), salt, ()=>{}, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.set('password', hash);
            next();
        });
    });
});

userSchema.path('password').validate((password: string) => password.length >=5, "Password cannot be shorter than 5 characters");

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword: string, cb: (err: Error, res: any) => void) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', { transform: (doc: IUserDocument, obj: IUser) => {delete obj.password; return obj;} });

export const User: Model<IUserDocument> = model('User', userSchema);