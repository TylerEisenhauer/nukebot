import mongoose, {Schema, Document} from 'mongoose';

export interface ISale extends Document{
    amountCollected: number
    buyerBattleTag: string
    buyerName: string
    date: Date
    price: number
}

const SaleSchema: Schema = new Schema({
    amountCollected: {type: Number, required: false},
    buyerBattleTag: {type: String, required: true},
    buyerName: {type: String, required: true},
    date: {type: Date, required: true},
    price: {type: Number, required: false}
})

export default mongoose.model<ISale>('Sale', SaleSchema)

