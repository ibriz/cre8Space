import express from "express";
import {contentIncentivization, transfer_sui} from "../utils/incentivizeContent";
import Content from '../models/Content'; 
import { Incentivization } from "../models/Incentivization";
import {getTotalAccruedPointsForOwner} from '../utils/getTotalAccruedPoint'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const incentivizeContent = async (req: express.Request, res: express.Response) => {
    try {
        const { blob_id } = req.body; 
        if (!Array.isArray(blob_id) || blob_id.length === 0) {
            return res.status(400).json({ error: 'Invalid input: blob_ids must be an array.' });
          }

        const results = [];
        for (const single_blob of blob_id) {
            const result = await contentIncentivization(single_blob);
            results.push(result);
            await delay(2000); // Delay of 2 seconds
        }

        res.status(200).send({ message: 'Incentivization successful', results });
      } catch (error) {
        console.error('Error fetching dynamic fields:', error);
        res.status(500).send('Error fetching dynamic fields');
      }
};

export const getIncentivizationData = async (req: express.Request, res: express.Response) => {
    try {
        const { ownerAddress } = req.params;
        const incentivizationData = await Incentivization.findOne({ owner: ownerAddress });
  
      if (!incentivizationData) {
        return res.status(404).send({ message: 'No incentivization data found' });
      }
  
      // Send the fetched data as the response
      res.status(200).send({ message: 'Incentivization data retrieved successfully', results: incentivizationData });
    } catch (error) {
      console.error('Error fetching incentivization data:', error);
      res.status(500).send('Error fetching incentivization data');
    }
  };

export const getAllOwnerAccruedPoints = async (req: express.Request, res: express.Response) => {
    try {
      const owners = await Content.distinct('owner');
  
      const results = [];
  
      for (const owner of owners) {
        const totalAccruedPoints = await getTotalAccruedPointsForOwner(owner);
        // Find the current points in the Incentivization model for this owner
        let incentivizationRecord = await Incentivization.findOne({ owner });
  
        const previouslyIncentivizedPoints = incentivizationRecord ? incentivizationRecord.incentivizedPoints : 0;
        
        let totalPoints = Number(totalAccruedPoints.accruedPoints)
        // Calculate the new points to be added
        const newPoints = totalPoints - previouslyIncentivizedPoints;
        
        if (newPoints > 0) {
            await transfer_sui(newPoints * 10_000_000, owner);
            if (incentivizationRecord) {
                incentivizationRecord.incentivizedPoints = totalPoints;
                await incentivizationRecord.save();
            } 
            else {
                incentivizationRecord = new Incentivization({
                owner,
                incentivizedPoints: totalPoints,
            });
            await incentivizationRecord.save();
            }
            await delay(2000);
        }
  
        results.push({
          ownerAddress: owner,
          incentivizedPoints: totalPoints,
        });
      }
  
      res.status(200).send({ message: 'Incentivization data retrieved successfully', results: results });
    } catch (error) {
      console.error('Error updating incentivization points:', error);
      throw error;
    }
  };