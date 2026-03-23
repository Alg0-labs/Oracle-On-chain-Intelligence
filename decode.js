const { ethers } = require("ethers");
const axios = require("axios");
const fs = require("fs");

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const ETH_USD_CACHE = new Map();

function topicToAddress(topic) {
  return ethers.getAddress("0x" + topic.slice(26));
}

function extractTransactions(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.transactions)) return payload.transactions;
  throw new Error("Input must be an array or an object with a transactions array");
}

async function getEthPriceUsd(blockTime) {
  // Cache by day to keep requests quick.
  const date = new Date(blockTime);
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
  if (ETH_USD_CACHE.has(key)) return ETH_USD_CACHE.get(key);

  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const url = `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${dd}-${mm}-${yyyy}&localization=false`;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    const price = res.data?.market_data?.current_price?.usd ?? null;
    ETH_USD_CACHE.set(key, price);
    return price;
  } catch {
    ETH_USD_CACHE.set(key, null);
    return null;
  }
}

async function summarizeTx(tx) {
  const gasUsed = BigInt(tx.gas_used || "0x0");
  const effectiveGasPrice = BigInt(tx.effective_gas_price || "0x0");
  const feeWei = gasUsed * effectiveGasPrice;
  const feeNative = Number(ethers.formatEther(feeWei));
  const ethUsd = await getEthPriceUsd(tx.block_time);
  const feeUsd = ethUsd == null ? null : Number((feeNative * ethUsd).toFixed(6));

  const transfers = (tx.logs || [])
    .filter((log) => (log.topics?.[0] || "").toLowerCase() === TRANSFER_TOPIC)
    .map((log) => ({
      tokenAddress: ethers.getAddress(log.address),
      from: topicToAddress(log.topics[1]),
      to: topicToAddress(log.topics[2]),
      amountRaw: BigInt(log.data).toString(),
    }));

  return {
    hash: tx.hash,
    blockTime: tx.block_time,
    txFrom: tx.from,
    txTo: tx.to,
    feeWei: feeWei.toString(),
    feeNativeEth: feeNative,
    feeUsd,
    transfers,
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node decode.js <input-json-file>");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const payload = JSON.parse(raw);
  const txs = extractTransactions(payload);

  const out = [];
  for (const tx of txs) {
    out.push(await summarizeTx(tx));
  }

  const outputPath = "decoded-transactions.json";
  fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
  console.log(`Saved ${out.length} decoded transactions to ${outputPath}`);
}

main().catch((err) => {
  console.error("Failed to decode transactions:", err.message);
  process.exit(1);
});