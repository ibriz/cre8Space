import express from 'express';
import connectDB from './utils/mongodb';
import cron from 'node-cron';
import fetch from 'node-fetch';
import addMetadataRoute from './router/addMetadata.route';
import getAllContentRoute from './router/getAllContent.route';
import obfuscate from './router/obfuscation.route';
import bodyParser from 'body-parser';
import incentivizeContentRoute from './router/incentivizeContent.route';
import cors from 'cors';

const app = express();

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false,
}))
app.use(
    cors({
      credentials: true,
    })
  );
  
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');

    const router = express.Router();

    addMetadataRoute(router);
    getAllContentRoute(router);
    obfuscate(router);
    getAllContentRoute(router); 
    incentivizeContentRoute(router)

    app.use('/api', router);

    // Start the Express server
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port ${process.env.PORT || 3000}`);
      });

    // Schedule a cron job to hit the '/fetchDynamicFields' endpoint every minute
    cron.schedule('* * * * *', async () => {
      console.log('Cron job triggered: fetching dynamic fields');
      try {
        await fetch('http://localhost:3000/api/addMetadatainDB');
        console.log('Successfully fetched object');
      } catch (error) {
        console.error('Error in cron job while fetching dynamic fields:', error);
      }
    });

    cron.schedule('0 */12 * * *', async () => {
        console.log('Cron job triggered: running incentivization');
        try {
          await fetch('http://localhost:3000/api/startIncentivization');
          console.log('Incentivization process successfully executed');
        } catch (error) {
          console.error('Error in cron job during incentivization process:', error);
        }
      });


  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
