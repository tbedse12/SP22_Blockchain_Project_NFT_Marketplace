const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()
  const signerAddress = signer.address.toLowerCase();
  
  const ERC721 = await ethers.getContractFactory("Car")
  const erc721 = ERC721.attach(process.env.ERC721_ADDRESS);
  
  const martAddress = process.env.MART_ADDRESS
  const MART = await ethers.getContractFactory("CarMart")
  const mart = MART.attach(martAddress);
  
  await erc721.setApprovalForAll(martAddress, true);

  const supply = await erc721.totalSupply();
  for (let i = 0; i < supply; i++) {
    const owner = (await erc721.ownerOf(i)).toLowerCase();
    if (owner === signerAddress) {
      const price = (i + 1) * 1000;
      console.log(`listing ${i} for ${price} CSH`);
      await mart.openTrade(i, price);
    }
  }
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})
