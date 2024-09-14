import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId , Content, SharedContents, TimeLine, AdminCap} from '../utils/packageInfo';
dotenv.config();

async function claimed_redeemed_points() {

    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::cep::claimed_redeemed_points`,
        arguments: [
            tx.object(AdminCap),
            tx.pure.address('0x16b80901b9e6d3c8b5f54dc8a414bb1a75067db897e7a3624793176b97445ec6'),
            tx.object(TimeLine),
        ]
    });
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result); 
}
claimed_redeemed_points();