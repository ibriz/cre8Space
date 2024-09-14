import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const basePublisherUrl = process.env.LOCAL_PUBLISHER_URL;
const baseAggregatorUrl = process.env.LOCAL_AGGREGATOR_URL;

// Walrus storage mechanism
export async function uploadCipherText(cipher: string): Promise<string> {
    console.log("Start upload cipher");
    const url = `${basePublisherUrl}/v1/store?epochs=1`;
    console.log(url);
    
    try{
      const res = await axios.put(url, {cipher});
      const blobID = res.data.newlyCreated.blobObject.blobId;
      console.log("Finish upload cipher");
      return `${baseAggregatorUrl}/v1/${blobID}`;
    }catch (e: any){
      return e;
    }
  }
  
  export async function uploadImage(image: string, name: string): Promise<{ url: string, blobID: string }> {
    const buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const response = await fetch(`${basePublisherUrl}/v1/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buf.length.toString(),
        'Content-Disposition': `attachment; filename="${name}"`,
      },
      body: buf,
    });
  
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    const responseBody = await response.json();
    const blobID = responseBody.newlyCreated.blobObject.blobId;
    const url = `${baseAggregatorUrl}/v1/${blobID}`;

    return { url, blobID };
  }
  