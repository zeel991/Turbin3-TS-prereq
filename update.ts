import {
    address,
    appendTransactionMessageInstructions,
    assertIsTransactionWithinSizeLimit,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    devnet,
    getSignatureFromTransaction,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    getProgramDerivedAddress,
    getAddressEncoder
  } from "@solana/kit";
  
  import { getUpdateInstruction } from "./clients/js/src/generated/index";
  import wallet from "./Turbin3-wallet.json";
  
  const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
  const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
  
  const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
  const rpcSubscriptions = createSolanaRpcSubscriptions(devnet('ws://api.devnet.solana.com'));
  
  const addressEncoder = getAddressEncoder();
  const accountSeeds = [Buffer.from("prereqs"), addressEncoder.encode(keypair.address)];
  const [account, _bump] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: accountSeeds
  });
  
  const updateIx = getUpdateInstruction({
    github: "zeel991", // PUT YOUR REAL GITHUB USERNAME HERE
    user: keypair,
    account,
    systemProgram: SYSTEM_PROGRAM
  });
  
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(keypair, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstructions([updateIx], tx)
  );
  
  const signedTx = await signTransactionMessageWithSigners(transactionMessage);
  assertIsTransactionWithinSizeLimit(signedTx);
  
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
  
  try {
    await sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' });
    const signature = getSignatureFromTransaction(signedTx);
    console.log(`Update Success! Check out your TX here:
  https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Update failed: ${e}`);
  }