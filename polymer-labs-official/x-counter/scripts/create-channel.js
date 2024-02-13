// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const config = require('../config.json');
const ibcConfig = require('../ibc.json');


function addressToPortId(portPrefix, address) {
  const suffix = address.slice(2);
  return `${portPrefix}.${suffix}`;
}

async function main() {
  if (config.createChannel.srcChain === 'optimism') {
    const dispatcherAddr = process.env.OP_DISPATCHER;
  } else if (config.createChannel.srcChain === 'base') {
    const dispatcherAddr = process.env.BASE_DISPATCHER;
  };

  const ibcAppSrc = await hre.ethers.getContractAt(
      `${config.srcContractType}`,
      config.createChannel.srcAddr
  );
  
  const connHop1 = ibcConfig[config.createChannel.srcChain].canonConnFrom;
  const connHop2 = ibcConfig[config.createChannel.dstChain].canonConnTo;

  const tx = await ibcAppSrc.createChannel(
    config.createChannel.version,
    config.createChannel.ordering,
    config.createChannel.fees,
    [ connHop1, connHop2 ],
    {
        portId: `${addressToPortId(`polyibc.${config.createChannel.dstChain}`,config.createChannel.dstAddr)}`,
        channelId: hre.ethers.encodeBytes32String(''),
        version: '',
    },
    {
        proofHeight: { revision_height: 0, revision_number: 0 },
        proof: hre.ethers.encodeBytes32String('abc')
    }

  );

  await new Promise((r) => setTimeout(r, 60000));

  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});