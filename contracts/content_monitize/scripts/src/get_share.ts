import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, TimeLine,   } from '../utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';
dotenv.config();

async function get_like() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
//     bcs.registerStructType('VecMap<K, V>', {
// 	keys: 'vector<K>',
// 	values: 'vector<V>',
// });

    tx.moveCall({
        target: `${packageId}::cep::get_share`,
        arguments: [
           tx.object(TimeLine), 
           tx.pure.address('0x16b80901b9e6d3c8b5f54dc8a414bb1a75067db897e7a3624793176b97445ec6'),
        ],
    });

    let currentAddress = '0x821febff0631744c231a0f696f62b72576f2634b2ade78c74ff20f1df97fc9bf';

    const results =
        await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: currentAddress,
        });
    console.log(results);

    //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
    let values = bcs.de('vector<u64>', Uint8Array.from(results.results![0].returnValues![0][0]));

    // console.log(`keys : ${inspect(keys, false, null, true)}\n`)
    console.log(`values: ${inspect(values, false, null, true)}\n`)
;
     
    
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
    const digest_ = result.objectChanges;
    console.log(digest_);
}
get_like()