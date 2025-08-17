import { NextFunction, Request, Response } from "express";
import { Account, AleoNetworkClient, AleoKeyProvider, BlockHeightSearch, NetworkRecordProvider, ProgramManager, initThreadPool } from "@provablehq/sdk";
import { cpus } from "os";
import dotenv from "dotenv";

dotenv.config();


export interface RouteConfig {
  price: number;
  network: string;
}

export type RoutesConfig = Record<string, RouteConfig>;

async function settleAleoTransaction(
  payTo: string,
  amount: number,
): Promise<string> {
  console.log(`Settlement amount: ${amount} microcredits`);
  // Initialize multi-threading optimized for Apple M3
  const cpuCount = cpus().length;
  console.log(`Available CPU cores: ${cpuCount}`);
  // M3 has 8 performance cores + 4 efficiency cores, use all performance cores
  await initThreadPool(Math.min(cpuCount, 12)); // Use up to 12 threads for M3
  
  // Create an account with the private key
  const account = new Account({privateKey: process.env.PRIVATE_KEY});

//   networkClient.setAccount(account);
//   const unspentRecords = networkClient.findRecords(
//     10064512, // Start block height
//     10064513, // End block height
//     true, // Find both spent and unspent records.
//     ["credits.aleo"],
//   );
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);
  
  // Pre-load transfer keys for private transactions
  const [transferPrivateProvingKey, transferPrivateVerifyingKey] = await keyProvider.transferKeys("private");
  
  // Create a new NetworkClient, KeyProvider, and RecordProvider
  const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
  const recordProvider = new NetworkRecordProvider(account, networkClient);
  // Create a new BlockHeightSearch
  const params = new BlockHeightSearch(10065484, 10065485);
  const record = await recordProvider.findCreditsRecord(amount, true, [], params);

  // Create program manager using the KeyProvider and NetworkProvider
  const programManager = new ProgramManager("https://api.explorer.provable.com/v1", keyProvider, recordProvider);
  
  // Set the account as the program caller
  programManager.setAccount(account);

  // Convert microcredits to credits and log
  const creditsAmount = amount / 1000000;
  console.log(`Transferring ${creditsAmount} credits (${amount} microcredits)`);
  
  // Build a transfer transaction
  const transaction = await programManager.buildTransferTransaction(
    creditsAmount,    // The amount to be transferred in credits
    payTo,     // The address of the recipient
    "private", // The transfer type
    0.1,       // The fee amount
    false,      // Indicates whether or not the fee will be private
    {},
    record.toString()
  );

  // Broadcast the transaction to the Aleo network
  const result = await programManager.networkClient.submitTransaction(transaction);
  
  console.log(`Transaction submitted successfully: ${result}`);
  
  // Return immediately after successful submission (don't wait for confirmation)
  return result;
}

function settleResponseHeader(response: any): string {
    return Buffer.from(JSON.stringify(response)).toString("base64");
}

export function paymentMiddleware(
  payTo: string,
  routes: RoutesConfig,
) {
  return async function paymentMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    // Match current request to route
    const routeKey = `${req.method} ${req.path}`;
    const routeConfig = routes[routeKey];
    
    if (!routeConfig) {
      res.status(404).json({
        error: "Route not configured for payments",
      });
      return;
    }

    const payment = req.header("X-PAYMENT");
    if (!payment) {
      res.status(402).json({
        error: "X-PAYMENT header is required",
        amount: routeConfig.price,
        recipient: payTo,
      });
      return;
    }


    /* eslint-disable @typescript-eslint/no-explicit-any */
    type EndArgs =
      | [cb?: () => void]
      | [chunk: any, cb?: () => void]
      | [chunk: any, encoding: string, cb?: () => void];
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const originalEnd = res.end.bind(res);
    let endArgs: EndArgs | null = null;

    res.end = function (...args: EndArgs) {
      endArgs = args;
      return res;
    };

    await next();

    if (res.statusCode >= 400) {
      res.end = originalEnd;
      if (endArgs) {
        originalEnd(...(endArgs as Parameters<typeof res.end>));
      }
      return;
    }

    try {
      const settlementTxId = await settleAleoTransaction(payTo, routeConfig.price);
      const responseData = {
        success: true,
        transaction: settlementTxId,
        network: "ALEO",
      };
      const responseHeader = settleResponseHeader(responseData);
      res.setHeader("X-PAYMENT-RESPONSE", responseHeader);
    } catch (error) {
      if (!res.headersSent) {
        res.status(402).json({
          error: `Settlement failed: ${error}`,
        });
        return;
      }
    } finally {
      res.end = originalEnd;
      if (endArgs) {
        originalEnd(...(endArgs as Parameters<typeof res.end>));
      }
    }
  };
}