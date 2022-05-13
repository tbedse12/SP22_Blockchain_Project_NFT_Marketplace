import Mcp from 'mcp.js';
import contract from './contract.js';
import { useEffect, useState } from 'react';
import './App.css';
// import contract from './contracts/NFTCollectible.json';
import carAbi from './contracts/Car.json';
import carmartAbi from './contracts/CarMart.json';
import carcashAbi from './contracts/CarCash.json';
// import { BigNumber, ethers } from 'ethers';

import Mcp from 'mcp.js';
import Big from 'bignumber.js';

const serverAddress = "http://localhost:5000/token"
const carAddress = "0xAadf0177e2292Bd8b80544e3732DDa690384e20E";
const carMartAddress = "0x6205D3e2Ef65FD9C6281F8c898b05a345852Ca77".toLowerCase();
const carCashAddress = "0xC29659862315d8BB4b02c128d1C4Bbbb6cdf2744";
// const abi = contract.a1bi;

const statusToString = (status) => {
  const bytes = [];
  for (let i = 2; i < status.length; i += 2) {
    const byte = parseInt(status.substring(i, i + 2), 16);
    if (byte == 0) {
      break;
    } else {
      bytes.push(byte);
    }
  }
  return String.fromCharCode(...bytes);
};

function App() {

  const [ mcp, setMcp ] = useState(null);
  const networks = {
    "3" : "http://13.212.177.203:8765",
    "4" : "http://18.182.45.18:8765"
  };
  const [currentAccount, setCurrentAccount] = useState(null);
  const [tokens, setTokens] = useState([]);

  const on_networkId_change = (networkId) => {
    const tmp = new Mcp();
    tmp.Contract.setProvider(networks[networkId]);
    setMcp(tmp);
    return tmp
  }

  const initializeWallet = (provider) => {
    provider.on("on_networkId_change", on_networkId_change);

    const mcp = on_networkId_change(provider.networkId);

    console.log("Found account address: ", provider.account);

    setCurrentAccount(provider.account);

    fetchTokens(mcp);
  }

  const checkWalletIsConnected = async () => {
    const { aleereum } = window;

    if (!aleereum || !aleereum.isConnected) {
      console.log("Make sure you have ALE WALLET installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    initializeWallet(aleereum);
  }

  const connectWalletHandler = async () => {
    const { aleereum } = window;

    if (!aleereum) {
      alert("Please install ALE WALLET!");
    }

    try {
      aleereum.connect();

      initializeWallet(aleereum);
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const prettyPrintCar = (token) => {
    return `${token.item.year} ${token.item.make} ${token.item.model} ${token.item.trim}`;
  }

  const onTradeSuccess = (token, status) => {
    return async (tx) => {
      if (tx.success) { // result is quite vague?
        const car = prettyPrintCar(token);

        if (status == 'Executed') {
          alert(`congrats! you're now the proud owner of ${car}!`);
        } else if (status == 'Open') {
          alert(`congrats! you listed ${car}!`);
        } else if (status == 'Cancelled') {
          alert(`well... you cancelled ${car}!`);
        }
      } else {
        console.error(tx);
      }
    };
  }

  const buyTokenHandler = (token, _) => {
    return async () => {
      console.log("user wants to buy", token);

      try {
        if (mcp) {
          const carCashContract = new mcp.Contract(
            carcashAbi, carCashAddress
          );
          const marketContract = new mcp.Contract(
            carmartAbi, carMartAddress
          );

          const available = await carCashContract.methods.balanceOf(currentAccount).call();
          const allowance = await carCashContract.methods.allowance(currentAccount, carMartAddress).call();

          if (available.lt(token.price) || allowance.lt(token.price)) {
            throw "insufficient CSH balance or allowance";
          } else {
            console.log(currentAccount, " can spend at most ", allowance.toString(), " CSH of their ", available.toString(), " CSH");
          }

          marketContract.methods.executeTrade(token._id).sendToBlock({
            from: currentAccount,
            amount: new Big('0').toString()
          }).then(onTradeSuccess(token, "Executed"));
        } else {
          console.log("Ethereum object does not exist");
        }
      } catch (err) {
        console.error(err.toString());
      }
    };
  }

  const sellTokenHandler = (token, index) => {
    return async () => {
      console.log("user wants to sell", token);

      try {
        if (mcp) {
          const marketContract = new mcp.Contract(carmartAbi, carMartAddress);
          const price = prompt("how much?", token.price);
          marketContract.methods.openTrade(index, price).sendToBlock({
            from: currentAccount,
            amount: new Big('0').toString()
          }).then(onTradeSuccess(token, "Open"));
        } else {
          throw("mcp object does not exist");
        }
      } catch (err) {
        console.error(err.toString());
      }
    };
  }

  const cancelTokenHandler = (token, index) => {
    return async () => {
      console.log("user wants to cancel", token);

      try {
        if (mcp) {
          const marketContract = new mcp.Contract(carmartAbi, carMartAddress);
          marketContract.methods.cancelTrade(token._id).sendToBlock({
            from: currentAccount,
            amount: new Big('0').toString()
          }).then(onTradeSuccess(token, "Cancelled"));
        } else {
          throw("mcp object does not exist");
        }
      } catch (err) {
        console.error(err.toString());
      }
    };
  }

  const tokenRow = (token, index) => {
    const generateButton = () => {
      if (token.owner == currentAccount.toLowerCase()) {
        if (token.status == 'Open') {
          return (
            <button onClick={cancelTokenHandler(token, index)} className='cta-button cancel-token-button'>
              Cancel
            </button>
          );
        } else {
          return (
            <button onClick={sellTokenHandler(token, index)} className='cta-button sell-token-button'>
              Sell
            </button>
          );
        }
      } else {
        if (token.status == 'Open') {
          return (
            <button onClick={buyTokenHandler(token, index)} className='cta-button buy-token-button'>
              Buy
            </button>
          );
        } else {
          return (
            "Not Available"
          );
        }
      }
    }

    return (
      <tr key={index}>
        <td><img height="200px" src={token.item.image}/></td>
        <td>{prettyPrintCar(token)}</td>
        <td>{token.price} CSH</td>
        <td>
        {generateButton()}
        </td>
      </tr>
    );
  }

  const tokenTable = () => {
    if (tokens) {
      return (
        <div>
          <h3>Token List</h3>
          <table className="table table-striped" style={{"marginLeft": "auto", "marginRight": "auto"}}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Kind</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{[...tokens.keys()].map((key) => tokenRow(tokens.get(key), key))}</tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      );
    }
  }

  const fetchTokens = async (provider) => {
    try {
      provider = mcp ? mcp : provider;
      if (!provider) throw "no provider";

      const carContract = new provider.Contract(carAbi, carAddress);
      const marketContract = new provider.Contract(carmartAbi, carMartAddress);

      console.log(marketContract);

      const START_BLOCK = 0;
      const events = await marketContract.getPastEvents('TradeStatusChange', {                               
        fromBlock: START_BLOCK,     
        toBlock: 'latest'
      });

      const ads = new Set();
      events.forEach(event => {
        ads.add(event.returnValues.ad.toString());
      });

      const trades = new Map();
      const owners = new Map();

      const getOwner = async (item) => {
        const key = item.toString();
        if (owners.has(key)) {
          return owners.get(key);
        } else {
          const owner = (await carContract.methods.ownerOf(item).call()).toLowerCase();
          owners.set(key, owner);
          return owner;
        }
      };

      for (const ad of ads.values()) {
        const trade = await marketContract.methods.getTrade(ad).call();
        const trader = trade[0].toLowerCase();
        const item = trade[1];
        const price = trade[2];
        const status = trade[3];
        const legibleStatus = statusToString(status);
        const carUri = await carContract.methods.tokenURI(item).call();
        const owner = await getOwner(item);
        const carResponse = await fetch(`${serverAddress}/${encodeURIComponent(carUri)}`);
        const carJson = await carResponse.json();
        const inEscrow = owner === carMartAddress;
        console.log(owner, trader, inEscrow);
        trades.set(item.toString(), {
          '_id': ad,
          'owner': inEscrow ? trader : owner,
          'item': carJson,
          'price': price.toString(),
          'status': legibleStatus
        });
      }

      setTokens(trades);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchTokens();

    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>Used Car Marketplace (Very Legit)</h1>
      <div>
        {currentAccount ? tokenTable() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;
