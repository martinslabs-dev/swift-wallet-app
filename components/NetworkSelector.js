
import { useNetwork } from '../context/NetworkContext';
import styles from '../styles/modules/NetworkSelector.module.css';

const NetworkSelector = () => {
    const { activeNetwork, switchNetwork, availableNetworks } = useNetwork();

    const handleNetworkChange = (e) => {
        switchNetwork(e.target.value);
    };

    return (
        <div className={styles.networkSelectorContainer}>
            <span className={styles.networkIcon}>🌐</span>
            <select
                className={styles.networkSelector}
                value={activeNetwork.id}
                onChange={handleNetworkChange}
            >
                {Object.values(availableNetworks).map((network) => (
                    <option key={network.id} value={network.id}>
                        {network.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default NetworkSelector;
