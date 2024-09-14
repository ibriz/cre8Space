import express from 'express';
import { addMetadata } from '../controllers/addMetada.controller'; 

export default (router: express.Router) => {
  router.get('/addMetadatainDB', addMetadata);
};