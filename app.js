import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import sequelize from './config/database.js';
import './config/config-passport.js';
import contactsRouter from './routes/contactsRouter.js';
import authRouter from './routes/authRouter.js';
import User from './models/User.js';
import Contact from './models/Contact.js';

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);

app.use((_, res) => {
    res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Route not found',
        data: 'Not Found',
    });
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Server error' } = err;
    res.status(status).json({
        status: 'error',
        code: status,
        message,
        data: message,
    });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful');

        User.hasMany(Contact, { foreignKey: 'owner' });
        Contact.belongsTo(User, { foreignKey: 'owner' });

        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`Server is running. Use our API on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();
