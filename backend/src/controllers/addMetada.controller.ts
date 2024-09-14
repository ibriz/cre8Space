import express from "express";
import fetchAndStoreObject from "../utils/getContent";

export const addMetadata = async (
  req: express.Request,
  res: express.Response,
) => {
    try {
        await fetchAndStoreObject();
        res.status(200).send('Object fetched and stored successfully');
      } catch (error) {
        console.error('Error fetching dynamic fields:', error);
        res.status(500).send('Error fetching dynamic fields');
      }
};