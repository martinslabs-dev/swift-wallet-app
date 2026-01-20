import { useState, useEffect } from 'react';

const scenes = [
  {
    graphic: () => <div className="w-32 h-32 rounded-full bg-energy-gradient flex items-center justify-center"><p className="text-black font-bold">VAULT</p></div>,
    text: 'Your Assets, Fortified.',
  },
  {
    graphic: () => <div className="w-32 h-32 flex items-center justify-around"><div className="w-12 h-12 rounded-full bg-electric-cyan"></div><div className="w-12 h-12 rounded-full bg-magenta"></div></div>,
    text: 'Instantaneous Atomic Swaps.',
  },
  {
    graphic: () => <div className="w-48 h-2 bg-energy-gradient"></div>,
    text: 'Journey Across Blockchain Stars.',
  },
  {
    graphic: () => <div className="w-32 h-32 rounded-full bg-light-cyan flex items-center justify-center"><p className="text-black font-bold">+10%</p></div>,
    text: 'Activate Your Yield Engine.',
  },
  {
    graphic: () => <div className="w-32 h-24 bg-glass-white rounded-lg border-2 border-glass-border"></div>,
    text: 'Curate Your Digital Identity.',
  },
];

const AnimatedShowcase = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % scenes.length);
    }, 5000); // Each scene lasts for 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full aspect-square mb-10 flex flex-col items-center justify-center relative">
      <div className="absolute w-full h-full bg-energy-gradient rounded-full opacity-10 blur-3xl"></div>
      
      {scenes.map((scene, index) => {
        const isCurrent = index === currentSceneIndex;
        const Graphic = scene.graphic;

        return (
          <div
            key={index}
            className={`absolute w-full h-full flex flex-col items-center justify-center transition-opacity duration-1000 ${isCurrent ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className={`w-5/6 h-3/5 glass-card rounded-3xl flex items-center justify-center border-2 border-glass-border/50 animate-fly-in`}>
                <Graphic />
            </div>
            <p className="text-light-cyan/80 text-lg mt-6 animate-fly-in" style={{animationDelay: '200ms'}}>
                {scene.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedShowcase;
