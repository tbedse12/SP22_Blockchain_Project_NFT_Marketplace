const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

const baseUri = 'https://raw.githubusercontent.com/SophieLiuYQ/SP22_Blockchain_Project_NFT_Marketplace/main/server/metadata';
const cars = [
    'corvette',
    'delsol',
    'supra',
    'gtr'
];

async function main() {
  const [owner] = await ethers.getSigners()
  const ERC721 = await ethers.getContractFactory("Car")
  const erc721 = ERC721.attach(process.env.ERC721_ADDRESS);
  for (const car of cars) {
    try {
      const tx = await erc721.safeMint(owner.address, `${baseUri}/${car}.json`);
      console.log(`success, minted ${car}: ${tx}`);
    } catch (err) {
      console.error(`failed to mint ${car}: ${err}`);
    }
  }
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})
