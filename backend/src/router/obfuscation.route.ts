import express from 'express';
import { obfuscateContent, deObfuscateContent, uploadContents } from '../controllers/obfuscation.controller';

export default (router: express.Router) => {
    router.post('/obfuscate-and-upload', obfuscateContent);
    router.post('/deobfuscate', deObfuscateContent);
    router.post('/upload-obfuscated-content', uploadContents);
};