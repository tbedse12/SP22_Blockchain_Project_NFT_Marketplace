const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

async function main() {
  const [signer] = await ethers.getSigners()

  const ERC20 = await ethers.getContractFactory("CarCash");
  const erc20 = ERC20.attach(process.env.ERC20_ADDRESS);

  await erc20.approve(process.env.MART_ADDRESS, 10000);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})
