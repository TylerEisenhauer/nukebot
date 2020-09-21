import mongoose, { Schema, Document } from 'mongoose';
import {IRaffle} from './raffle';

export interface IRaffleEntry extends Document {
    discordId: string
    name: string
    proof: any
    raffle: IRaffle['_id']
    time: Date
}

const RaffleEntrySchema: Schema = new Schema({
    discordId: {type: String, required: true},
    name: {type: String, required: true},
    proof: {type: String, required: true},
    raffle: {type: Schema.Types.ObjectId, required: true},
    time: {type: String, required: true}
})

export default mongoose.model<IRaffleEntry>('RaffleEntry', RaffleEntrySchema)