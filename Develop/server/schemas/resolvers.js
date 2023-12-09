const { Book, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        user: async (parent, {_id}) => {
            const currentUser = context.user;
            if (!currentUser) {
                throw new Error('Not logged in');
            }

            const user = await User.findById(currentUser._id);
            return user;
        }
    },
    addUser: async (parent, { email}) => {
        
        const emailRegex = /.+@.+\..+/
        if (!emailRegex.test(email)) {
            throw new Error('Must use a valid email address')
        }

        const user = await User.create(args)

        const token = signToken({ email, _id })
        
        return { token, user }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError
            }

            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw AuthenticationError
            }

            const token = signToken(user);

            return { user, token }
        },
    },
    saveBook: async (parent, { input }, context) => {

        if (!context.user) {
            throw AuthenticationError;
        }

        const user = await User.findByIdAndUpdate(
            context.user._id,
            { $push: { savedBooks: input } },
            { new: true }
        );

        return user
    },
    deleteBook: async ( parent, { bookId }, context) => {

        if (!context.user) {
            throw AuthenticationError;
        }

        const newUser = await User.findByIdAndUpdate(
            context.user._id,
            { $pull: { savedBooks: { bookId } } },
            { new: true }
        );

        return newUser
    }
};

module.exports = resolvers;