import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contact = sequelize.define(
    'contact',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'contacts',
        timestamps: true,
    }
);

export default Contact;
