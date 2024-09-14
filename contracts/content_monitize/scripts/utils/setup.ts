import { SuiObjectChangePublished } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import getExecStuff from './execStuff';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const getPackageId = async () => {
    let packageId = ''; 
    let SharedContents = '';
    let AdminCap = '';
    let UpgradeCap = '';

    try {
        const { keypair, client } = getExecStuff();
        // change account to your own address to deploy the contract
        const account = "0x16b80901b9e6d3c8b5f54dc8a414bb1a75067db897e7a3624793176b97445ec6";
        const packagePath = process.cwd();
        const { modules, dependencies } = JSON.parse(
            execSync(`sui move build --dump-bytecode-as-base64 --path ${packagePath} --skip-fetch-latest-git-deps`, {
                encoding: "utf-8",
            })
        );
        const tx = new TransactionBlock();
        const [upgradeCap] = tx.publish({
            modules,
            dependencies,
        });
        tx.transferObjects([upgradeCap], tx.pure(account));
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showObjectChanges: true,
            }
        });
        console.log(result.digest);
        const digest_ = result.digest;

        packageId = ((result.objectChanges?.filter(
            (a) => a.type === 'published',
        ) as SuiObjectChangePublished[]) ?? [])[0].packageId.replace(/^(0x)(0+)/, '0x') as string;

        await sleep(10000);

        if (!digest_) {
            console.log("Digest is not available");
            return { packageId };
        }

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
        let output: any;
        output = txn.objectChanges;

        for (let i = 0; i < output.length; i++) {
            const item = output[i];
            if (await item.type === 'created') {

                if (await item.objectType === `${packageId}::cep::ContentInfo`) {
                    SharedContents = String(item.objectId);
                }

                if (await item.objectType === `${packageId}::roles::AdminCap`) {
                    AdminCap = String(item.objectId);
                }
                if (await item.objectType === `0x2::package::UpgradeCap`) {
                   UpgradeCap = String(item.objectId);
              } 
            }
        }

        // Write the results to a file
        const content = `export let packageId = '${packageId}';
export let SharedContents = '${SharedContents}';
export let AdminCap = '${AdminCap}';
export let UpgradeCap = '${UpgradeCap}';\n`;

        await fs.writeFile(`${packagePath}/scripts/utils/packageInfo.ts`, content)

        return { packageId, SharedContents, AdminCap,  UpgradeCap };
    } catch (error) {
        console.error(error);
        return { packageId, SharedContents, AdminCap, UpgradeCap};
    }
};

// Call the async function and handle the result.
getPackageId()
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });

export default getPackageId;
