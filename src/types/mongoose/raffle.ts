import mongoose, {Schema, Document} from 'mongoose';
import {IRaffleEntry} from './raffleentry';

export interface IRaffle extends Document{
    startedAt: Date
    endedAt: Date
    channel: string
    message: string
    winner?: IRaffleEntry['_id']
}

const RaffleSchema: Schema = new Schema({
    startedAt: {type: Date, required: true},
    endedAt: {type: Date, required: false},
    channel: {type: String, required: true},
    message: {type: String, required: true},
    winner: {type: Schema.Types.ObjectId, required: false}
})

export default mongoose.model<IRaffle>('Raffle', RaffleSchema)

