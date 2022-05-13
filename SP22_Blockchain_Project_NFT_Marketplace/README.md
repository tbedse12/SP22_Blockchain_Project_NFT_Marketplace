# NFT Collectible Smart Contract

This project is a classifieds-style marketplace for exchanging ERC20 tokens for ERC721 NFTs. Our example is a used-car marketplace, complete with `Car`, `CarCash`, and `CarMart` smart contracts.

The front-end is based on React.js, while the back-end is based on Express.js. The main purpose for the back-end is to retrieve the metadata for our `Car` tokens (to bypass Cross-Origin Resource Sharing (CORS)).

To run and set up the project, run the following commands:
```
$ cd server/
$ npm i
$ npm start &
$ cd ..
$ npm i
$ npm start
```

One can deploy and setup the contracts using the files under the `scripts/` directory.
