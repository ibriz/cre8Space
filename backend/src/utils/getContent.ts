import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import Content from '../models/Content';
import * as dotenv from 'dotenv';
dotenv.config();

const fetchAndStoreObject = async () => {

    try {
        const client = new SuiClient({
            url: getFullnodeUrl('testnet'),
        }); 

        const parentId = process.env.CONTENT_INFO as string;
        console.log(parentId);
        const result = await client.getObject({ id: parentId, options: {showContent: true} });
        const fields = (result.data?.content as { fields: any })?.fields;
        for (const data of fields.registered_content) {

            let objId = data;
            const objDetails = await client.getObject({id: objId, 
                options: {showContent: true}
            });

            const fields = (objDetails.data?.content as { fields: any })?.fields;
            const { blob_id, file_type, encrypted_obj, description, owner, title, tag } = fields;
            const existingField = await Content.findOne({ blob_id });

            if (!existingField) {
            const newField = new Content({
                blob_id,
                file_type,
                encrypted_obj,
                description,
                owner,
                title,
                tag, 
                content: objId, 
                incentivized_amount: 0 
              });
      
                await newField.save();
                console.log(`Stored new field: ${data}`);
                await sendDataToIngestEndpoint({ blob_id, file_type, description, owner, title, tag });
            } else {
                console.log(`Field ${data} already exists, skipping.`);
            }
        }
    } catch (error) {
        console.error('Error fetching fields:', error);
    }
};

// Function to send data to the ingest endpoint
const sendDataToIngestEndpoint = async (data: { blob_id: string, file_type: string, description: string, owner: string, title: string, tag: string }) => {
  try {
    const response = await fetch('http://34.204.9.159:8000/api/v1/kb/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send data to ingest endpoint: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Data successfully sent to the ingest endpoint:', responseData);
  } catch (error) {
    console.error('Error sending data to ingest endpoint:', error);
  }
};

export default fetchAndStoreObject;
