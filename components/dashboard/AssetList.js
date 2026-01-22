import AssetListItem from './AssetListItem';

const assets = [
  {
    name: 'Bitcoin',
    icon: '/bitcoin.png',
    price: '42,000.00',
    change: '+2.5%',
    marketCap: '800B',
  },
  {
    name: 'Ethereum',
    icon: '/ethereum.png',
    price: '2,500.00',
    change: '+5.2%',
    marketCap: '300B',
  },
  {
    name: 'Solana',
    icon: '/solana.png',
    price: '100.00',
    change: '-1.8%',
    marketCap: '50B',
  },
];

const AssetList = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-white">Your Assets</h2>
    <div className="space-y-4">
      {assets.map((asset) => (
        <AssetListItem key={asset.name} asset={asset} />
      ))}
    </div>
  </div>
);

export default AssetList;
