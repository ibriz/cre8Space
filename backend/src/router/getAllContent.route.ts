import express from "express";

import {
  getAllContentMetadata,
  getBlobContent,
  getContentByOwner,
  getAllOwners,
  getContentByBlob
} from "../controllers/getContent.controller";

export default (router: express.Router) => {
  router.get('/getAllContentMetadata', getAllContentMetadata)
  router.get('/getBlobContent/:blob_id', getBlobContent)
  router.get('/getContentByOwner/:owner', getContentByOwner);
  router.get('/getContent/:blob_id', getContentByBlob)
  router.get('/getAllOwners', getAllOwners);

};