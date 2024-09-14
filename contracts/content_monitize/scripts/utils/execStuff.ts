import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair, } from '@mysten/sui.js/keypairs/ed25519';
import * as dotenv from 'dotenv';
dotenv.config();

const MNEMONICS = process.env.MNEMONICS || '';
const getExecStuff = () => {
    const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });
    //console.log(keypair, client)
    return { keypair, client };
}
export default getExecStuff;