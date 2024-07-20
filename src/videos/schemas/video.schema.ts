import {Schema } from 'mongoose';

export const videoSchema = new Schema({
    title: String,
    description: String,
    filename: String,
    path: String,
    createdAt: { type: Date, default: Date.now },
});