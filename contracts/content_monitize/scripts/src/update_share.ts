import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId , Content, SharedContents, TimeLine, AdminCap} from '../utils/packageInfo';
dotenv.config();

async function like_content() {

    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::cep::update_share`,
        arguments: [
            tx.object(AdminCap),
            tx.pure.address('0x16b80901b9e6d3c8b5f54dc8a414bb1a75067db897e7a3624793176b97445ec6'),
            tx.pure.address(Content),
            tx.object(TimeLine),
            tx.pure.u64(323),
        ]
    });
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result); 
}
like_content();