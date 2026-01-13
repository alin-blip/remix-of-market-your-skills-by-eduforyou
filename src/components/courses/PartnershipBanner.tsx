import { motion } from 'framer-motion';

// Partner logos with brand colors for styling
const partners = [
  { 
    name: 'Google', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    color: '#4285F4' 
  },
  { 
    name: 'Microsoft', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    color: '#00A4EF' 
  },
  { 
    name: 'AWS', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    color: '#FF9900' 
  },
  { 
    name: 'HubSpot', 
    logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-ar21.svg',
    color: '#FF7A59' 
  },
  { 
    name: 'Harvard', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Harvard_University_logo.svg',
    color: '#A51C30' 
  },
  { 
    name: 'freeCodeCamp', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Fcc_primary_large.png',
    color: '#0A0A23' 
  },
  { 
    name: 'Coursera', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
    color: '#0056D2' 
  },
  { 
    name: 'OpenAI', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    color: '#10A37F' 
  },
];

export function PartnershipBanner() {
  return (
    <div className="py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-muted/30 to-background" />
      
      <div className="relative">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            În parteneriat cu
          </p>
        </div>
        
        {/* Logo slider with infinite scroll effect */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex items-center justify-center gap-12 overflow-hidden">
            <motion.div 
              className="flex items-center gap-12"
              animate={{ x: [0, -100, 0] }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-center h-10 min-w-[120px] grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                >
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${partner.name}</span>`;
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple static version without animation
export function PartnershipLogos({ providers }: { providers: string[] }) {
  const partnerData: Record<string, { logo?: string; color: string }> = {
    'Google': { logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', color: '#4285F4' },
    'Microsoft': { logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', color: '#00A4EF' },
    'AWS': { logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', color: '#FF9900' },
    'HubSpot': { logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg', color: '#FF7A59' },
    'Harvard': { color: '#A51C30' },
    'freeCodeCamp': { color: '#0A0A23' },
    'Coursera': { logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg', color: '#0056D2' },
    'OpenAI': { logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', color: '#10A37F' },
    'DeepLearning.AI': { color: '#FF6F61' },
    'fast.ai': { color: '#00A7E1' },
    'TensorFlow': { color: '#FF6F00' },
    'GitHub': { color: '#333' },
    'TryHackMe': { color: '#212C42' },
    'Hack The Box': { color: '#9FEF00' },
    'MDN': { color: '#000' },
    'Codecademy': { color: '#1F4056' },
  };

  const uniqueProviders = [...new Set(providers)];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {uniqueProviders.map((provider) => {
        const data = partnerData[provider] || { color: '#666' };
        return (
          <div
            key={provider}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            {data.logo ? (
              <img 
                src={data.logo} 
                alt={provider}
                className="h-5 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-sm font-medium">${provider}</span>`;
                }}
              />
            ) : (
              <span className="text-sm font-medium">{provider}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
