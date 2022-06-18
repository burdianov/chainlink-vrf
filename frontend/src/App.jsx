import { useEffect, useRef, useState } from 'react';
import { Contract, providers, utils } from 'ethers';
import Web3Modal from 'web3modal';

import { abi, RANDOM_WINNER_GAME_CONTRACT } from './constants';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [maxPlayers, setMaxPlayers] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [joinGameFee, setJoinGameFee] = useState('');

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert('Change the network to Mumbai');
      throw new Error('Change network to Mumbai');
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className=''>
          Connect wallet
        </button>
      );
    }

    if (loading) {
      return <button className=''>Loading...</button>;
    }

    return (
      <div className='w-1/2'>
        <div className='border-[1px] rounded-lg p-6'>
          <div className='flex flex-col mb-4'>
            <label htmlFor='players'>Max Players</label>
            <input
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className='px-4 py-2 border-gray-400 rounded-lg border-[1px] outline-none focus:shadow-lg transition'
              type='text'
              id='players'
            />
          </div>
          <div className='flex flex-col mb-4'>
            <label htmlFor='entry-fee'>Entry Fee</label>
            <input
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className='px-4 py-2 border-gray-400 rounded-lg border-[1px] outline-none focus:shadow-lg transition'
              type='text'
              id='entry-fee'
            />
          </div>
          <div className='text-center'>
            <button
              onClick={startGame}
              className='px-4 py-2 bg-green-400 rounded-lg hover:shadow-lg transition active:bg-green-500'
            >
              Start Game
            </button>
          </div>
        </div>
        <div className='border-[1px] rounded-lg p-6 mt-4'>
          <div className='flex flex-col mb-4'>
            <label htmlFor='join-game'>Join Game Fee</label>
            <input
              value={joinGameFee}
              onChange={(e) => setJoinGameFee(e.target.value)}
              className='px-4 py-2 border-gray-400 rounded-lg border-[1px] outline-none focus:shadow-lg transition'
              type='text'
              id='join-game'
            />
          </div>
          <div className='text-center'>
            <button
              onClick={joinGame}
              className='px-4 py-2 bg-indigo-400 rounded-lg hover:shadow-lg transition active:bg-indigo-500'
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  const startGame = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const gameContract = new Contract(
        RANDOM_WINNER_GAME_CONTRACT,
        abi,
        signer
      );

      const tx = await gameContract.startGame(maxPlayers, entryFee);
      tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const joinGame = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const gameContract = new Contract(
        RANDOM_WINNER_GAME_CONTRACT,
        abi,
        signer
      );

      const tx = await gameContract.joinGame({
        value: utils.parseEther(joinGameFee.toString())
      });
      tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'mumbai',
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center'>
      {renderButton()}
    </div>
  );
}

export default App;
