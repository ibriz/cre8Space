import fetch from 'node-fetch';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.AGGREGATOR_URL as string;

export const fetchApiData = async (blob_id: string) => {
    try {
        const response = await fetch(`${API_URL}${blob_id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw new Error('Failed to fetch data from API');
    }
};
