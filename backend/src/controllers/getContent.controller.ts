import express from "express";
import Content from "../models/Content";
import { fetchApiData } from "../utils/fetchAggregatorData";

export const getAllContentMetadata = async (
  req: express.Request,
  res: express.Response,
) => {
    try {
        const contentList = await Content.find().sort({ createdAt: -1 });
        res.status(200).json(contentList);
      } catch (error) {
        console.error('Error retrieving content:', error);
        res.status(500).json({ error: 'An error occurred while retrieving content' });
      }
};

export const getAllOwners = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const ownersList = await Content.distinct("owner");
  
      res.status(200).json(ownersList); 
    } catch (error) {
      console.error('Error fetching owners:', error);
      res.status(500).json({ error: 'An error occurred while fetching owners' });
    }
  };

export const getContentByOwner = async (
    req: express.Request,
    res: express.Response
  ) => {
    const { owner } = req.params; 
  
    try {
      const contentList = await Content.find({ owner }).sort({ createdAt: -1 }); 
  
      if (contentList.length === 0) {
        return res.status(404).json({ message: 'No content found for this owner' });
      }
  
      res.status(200).json(contentList); 
    } catch (error) {
      console.error('Error fetching content by owner:', error);
      res.status(500).json({ error: 'An error occurred while fetching content by owner' });
    }
  };

export const getBlobContent = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const { blob_id } = req.params;

    try {
        const response = await fetchApiData(blob_id);
        let contentType = response.headers.get('content-type');

        if (!contentType) {
            contentType = 'application/octet-stream'; 
        }

        res.setHeader('Content-Type', contentType);
        const body = await response.buffer(); 
        res.send(body); 
    } catch (error) {
        console.error('Error retrieving content:', error);
        res.status(500).json({ error: 'An error occurred while retrieving content' });
    }
  };

  export const getContentByBlob = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const { blob_id } = req.params;

    try {
        const content = await Content.find({ blob_id }); 

        res.status(200).json(content); 
    } catch (error) {
        console.error('Error retrieving content:', error);
        res.status(500).json({ error: 'An error occurred while retrieving content' });
    }
  };