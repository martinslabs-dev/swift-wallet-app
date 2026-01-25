
import { useNetwork } from '../context/NetworkContext';
import styles from '../styles/modules/NetworkSelector.module.css';

const NetworkSelector = () => {
    const { activeNetwork, switchNetwork, availableNetworks } = useNetwork();

    const handleNetworkChange = (e) => {
        switchNetwork(e.target.value);
    };

    const mainnetNetworks = Object.values(availableNetworks).filter(network => network.type === 'mainnet');
    const testnetNetworks = Object.values(availableNetworks).filter(network => network.type === 'testnet');

    return (
        <div className={styles.networkSelectorContainer}>
            <span className={styles.networkIcon}>🌐</span>
            <select
                className={styles.networkSelector}
                value={activeNetwork.id}
                onChange={handleNetworkChange}
            >
                <option key="all" value="all">All Networks</option>
                <optgroup label="Mainnets">
                    {mainnetNetworks.map((network) => (
                        <option key={network.id} value={network.id}>
                            {network.name}
                        </option>
                    ))}
                </optgroup>
                <optgroup label="Testnets">
                    {testnetNetworks.map((network) => (
                        <option key={network.id} value={network.id}>
                            {network.name}
                        </option>
                    ))}
                </optgroup>
            </select>
        </div>
    );
};

export default NetworkSelector;
