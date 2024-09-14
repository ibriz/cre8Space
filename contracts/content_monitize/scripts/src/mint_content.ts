import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, SharedContents, } from '../utils/packageInfo';
import { promises as fs } from 'fs';
import * as path from 'path';
dotenv.config();

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function mint_content() {
    try {
        const { keypair, client } = getExecStuff();
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${packageId}::cep::mint_content`,
            arguments: [
                tx.pure.string(`Second doc`),
                tx.pure.string(`Sing{apore Blockchain Evenent`),
                tx.pure.string(`#BLOCKCHAIN `),
                tx.pure.string(`.txt`),
                tx.pure.string(`3311520380770600559503642007978274714790751685865655462527908072658294431891`), 
                tx.object(SharedContents), 
                tx.pure.string(`encrypted_obj`), 
            ],
        });

        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
        });
        console.log(result.digest);
        const digest_ = result.digest;
        
        await sleep(1000);
        const txn = await client.getTransactionBlock({
            digest: String(digest_),
            options: {
                showEffects: true,
                showInput: false,
                showEvents: false,
                showObjectChanges: true,
                showBalanceChanges: false,
            },
        });

        let output: any = txn.objectChanges;
        let Content;

        for (let item of output) {
            if (item.type === 'created' && item.objectType === `${packageId}::cep::Content`) {
                Content = String(item.objectId);
            }
        }

        console.log(`Content: ${Content}`);

        // Read the contents of packageInfo.ts
        const packageInfoPath = path.join(__dirname, '../utils/packageInfo.ts');
        let packageInfoContent = await fs.readFile(packageInfoPath, 'utf8');

        // Replace or append Content
        const contentLine = `export let Content = '${Content}';\n`;
        const contentRegex = /^export let Content = '.*';\n/m;

        if (contentRegex.test(packageInfoContent)) {
            packageInfoContent = packageInfoContent.replace(contentRegex, contentLine);
        } else {
            packageInfoContent += contentLine;
        }

        // Write the updated content back to packageInfo.ts
        await fs.writeFile(packageInfoPath, packageInfoContent);
        console.log('packageInfo.ts updated successfully');
    } catch (error) {
        console.error('Error in content', error);
    }
}

// Call the function with the desired amount
mint_content();