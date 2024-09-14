import express from 'express';
import { incentivizeContent, getAllOwnerAccruedPoints, getIncentivizationData } from '../controllers/incentivize.controller'; 

export default (router: express.Router) => {
  router.post('/incentivizeContent', incentivizeContent);
  router.get('/startIncentivization', getAllOwnerAccruedPoints);
  router.get('/getIncentivizationData/:ownerAddress', getIncentivizationData);
};