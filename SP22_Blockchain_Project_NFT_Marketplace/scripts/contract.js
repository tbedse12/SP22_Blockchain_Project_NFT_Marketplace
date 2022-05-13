const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

async function main() {

  const [owner] = await ethers.getSigners()

  const ERC20 = await ethers.getContractFactory("CarCash")
  const ERC721 = await ethers.getContractFactory("Car")
  const MART = await ethers.getContractFactory("CarMart")

  const deploy = async (token) => {
    const t = await token.deploy()
    await t.deployed()
    return [t, t.address]
  }

  const [erc20, erc20addr] = await deploy(ERC20)
  const [erc721, erc721addr] = await deploy(ERC721)

  const mart = await MART.deploy(erc20addr, erc721addr)
  await mart.deployed()

  console.log("ERC20 deployed to:", erc20addr)
  console.log("ERC721 deployed to:", erc721addr)
  console.log("MART deployed to:", mart.address)
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})