import mongoose from 'mongoose';

export default (connectionString: string) => {

    const connect = () => {
        mongoose
            .connect(
                connectionString,
                { useNewUrlParser: true }
            )
            .then(() => {
                return console.info(`Successfully connected to ${connectionString}`);
            })
            .catch(error => {
                console.error('Error connecting to database: ', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};