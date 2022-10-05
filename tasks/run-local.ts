import { TASK_COMPILE, TASK_NODE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';

task(
  'run-local',
  'Start a hardhat node, deploy contracts, and execute setup transactions',
).setAction(async (_, { ethers, run }) => {
  await run(TASK_COMPILE);

  await Promise.race([run(TASK_NODE), new Promise(resolve => setTimeout(resolve, 2_000))]);

  const contracts = await run('deploy-local');

  await run('populate-descriptor', {
    nftDescriptor: contracts.NFTDescriptorV2.instance.address,
    nounsDescriptor: contracts.NounsDescriptorV2.instance.address,
  });

  const unpauseResult = await (await contracts.NounsAuctionHouse.instance
    .attach(contracts.NounsAuctionHouseProxy.instance.address)
    .unpause({
      gasLimit: 1_000_000,
    })).wait();
  console.log(unpauseResult);
  console.log(unpauseResult.events.map((e: any) => e.args));

  const auction1 = await contracts.NounsAuctionHouse.instance
    .attach(contracts.NounsAuctionHouseProxy.instance.address)
    .auction({
      gasLimit: 1_000_000,
    });

  console.log('Auction 1');
  console.log(auction1);

  await (await contracts.NounsToken.instance
    .attach(contracts.NounsToken.instance.address)
    .addAddressToWhitelist(contracts.NounsAuctionHouseProxy2.instance.address, {
      gasLimit: 1_000_000,
    })).wait();

  const unpauseResult2 = await (await contracts.NounsAuctionHouse.instance
    .attach(contracts.NounsAuctionHouseProxy2.instance.address)
    .unpause({
      gasLimit: 1_000_000,
    })).wait();
  console.log(unpauseResult2);
  console.log(unpauseResult2.events.map((e: any) => e.args));

  const auction2 = await contracts.NounsAuctionHouse.instance
    .attach(contracts.NounsAuctionHouseProxy2.instance.address)
    .auction({
      gasLimit: 1_000_000,
    });
  console.log('Auction 2');
  console.log(auction2);
  const nounowner = await contracts.NounsToken.instance
    .attach(contracts.NounsToken.instance.address)
    .owner({
      gasLimit: 1_000_000,
    });
  console.log(nounowner);


  const seed0 = await contracts.NounsToken.instance
    .attach(contracts.NounsToken.instance.address)
    .seeds(0, {
      gasLimit: 1_000_000,
    });
  console.log(seed0);

  /*
  const noun0 = await contracts.NounsToken.instance
    .attach(contracts.NounsToken.instance.address)
    .tokenURI(0, {
      gasLimit: 9_000_000_000_000_000,
    });
  console.log(noun0);
  */

  // Transfer ownership
  const executorAddress = contracts.NounsDAOExecutor.instance.address;
  await contracts.NounsDescriptorV2.instance.transferOwnership(executorAddress);
  await contracts.NounsToken.instance.transferOwnership(executorAddress);
  await contracts.NounsAuctionHouseProxyAdmin.instance.transferOwnership(executorAddress);
  await contracts.NounsAuctionHouse.instance
    .attach(contracts.NounsAuctionHouseProxy.instance.address)
    .transferOwnership(executorAddress);
  console.log(
    'Transferred ownership of the descriptor, token, and proxy admin contracts to the executor.',
  );

  // await run('create-proposal', {
  //   nounsDaoProxy: contracts.NounsDAOProxy.instance.address,
  // });

  const { chainId } = await ethers.provider.getNetwork();

  const accounts = {
    'Account #0': {
      Address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      'Private Key': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    'Account #1': {
      Address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      'Private Key': '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    },
  };

  console.table(accounts);
  console.log(
    `Noun contracts deployed to local node at http://localhost:8545 (Chain ID: ${chainId})`,
  );
  console.log(`Auction House Proxy address: ${contracts.NounsAuctionHouseProxy.instance.address}`);
  console.log(`Auction House Proxy 2 address: ${contracts.NounsAuctionHouseProxy2.instance.address}`);
  console.log(`Nouns ERC721 address: ${contracts.NounsToken.instance.address}`);
  console.log(`Nouns DAO Executor address: ${contracts.NounsDAOExecutor.instance.address}`);
  console.log(`Nouns DAO Proxy address: ${contracts.NounsDAOProxy.instance.address}`);

  await ethers.provider.send('evm_setIntervalMining', [12_000]);

  await new Promise(() => {
    /* keep node alive until this process is killed */
  });
});
