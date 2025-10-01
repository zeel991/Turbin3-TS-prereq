import bs58 from "bs58";
import promptSync from "prompt-sync";

const prompt = promptSync();

// Convert Phantom base58 private key → Solana wallet bytes
function base58ToWallet() {
  const base58 = prompt("Enter your Phantom base58 private key: ");
  const wallet = bs58.decode(base58);
  console.log("Wallet bytes (for dev-wallet.json):", Array.from(wallet));
}

// Convert Solana wallet bytes → Phantom base58 private key
function walletToBase58() {
  const wallet: number[] = [
    100, 255, 183, 114, 49, 212, 178, 144, 68, 121, 232, 104, 254, 250, 117,
    117, 223, 24, 87, 155, 206, 161, 29, 102, 179, 237, 82, 204, 48, 255, 24,
    174, 255, 131, 165, 100, 236, 112, 37, 220, 54, 213, 205, 180, 127, 182, 91,
    172, 5, 84, 103, 234, 110, 18, 90, 208, 156, 126, 88, 174, 117, 149, 183,
    72,
  ];

  const base58 = bs58.encode(Uint8Array.from(wallet));
  console.log("Phantom base58 private key:", base58);
}

base58ToWallet();
walletToBase58();
