import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Partner logos with brand colors and IDs for navigation
const partners = [
  { 
    id: 'google',
    name: 'Google', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    color: '#4285F4' 
  },
  { 
    id: 'microsoft',
    name: 'Microsoft', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    color: '#00A4EF' 
  },
  { 
    id: 'aws',
    name: 'AWS', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    color: '#FF9900' 
  },
  { 
    id: 'hubspot',
    name: 'HubSpot', 
    logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-ar21.svg',
    color: '#FF7A59' 
  },
  { 
    id: 'harvard',
    name: 'Harvard', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Harvard_University_logo.svg',
    color: '#A51C30' 
  },
  { 
    id: 'freecodecamp',
    name: 'freeCodeCamp', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Fcc_primary_large.png',
    color: '#0A0A23' 
  },
  { 
    id: 'coursera',
    name: 'Coursera', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
    color: '#0056D2' 
  },
  { 
    id: 'openai',
    name: 'OpenAI', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    color: '#10A37F' 
  },
];

export function PartnershipBanner() {
  const navigate = useNavigate();

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
        
        {/* Logo grid - clickable */}
        <div className="flex flex-wrap items-center justify-center gap-8 px-4">
          {partners.map((partner, index) => (
            <motion.button
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/partners/${partner.id}`)}
              className="flex items-center justify-center h-12 min-w-[100px] px-4 rounded-lg bg-muted/30 hover:bg-muted/60 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
              title={`Vezi cursurile ${partner.name}`}
            >
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${partner.name}</span>`;
                }}
              />
            </motion.button>
          ))}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Click pe un partener pentru a vedea toate cursurile și certificările
        </p>
      </div>
    </div>
  );
}

// Simple static version with navigation
export function PartnershipLogos({ providers }: { providers: string[] }) {
  const navigate = useNavigate();
  
  const partnerData: Record<string, { id: string; logo?: string; color: string }> = {
    'Google': { id: 'google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', color: '#4285F4' },
    'Google Cloud': { id: 'google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', color: '#4285F4' },
    'Microsoft': { id: 'microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', color: '#00A4EF' },
    'AWS': { id: 'aws', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', color: '#FF9900' },
    'HubSpot': { id: 'hubspot', logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg', color: '#FF7A59' },
    'Harvard': { id: 'harvard', color: '#A51C30' },
    'freeCodeCamp': { id: 'freecodecamp', color: '#0A0A23' },
    'Coursera': { id: 'coursera', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg', color: '#0056D2' },
    'OpenAI': { id: 'openai', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', color: '#10A37F' },
    'DeepLearning.AI': { id: 'deeplearning', color: '#FF6F61' },
    'fast.ai': { id: 'fastai', color: '#00A7E1' },
    'TensorFlow': { id: 'tensorflow', color: '#FF6F00' },
    'GitHub': { id: 'github', color: '#333' },
    'TryHackMe': { id: 'tryhackme', color: '#212C42' },
    'Hack The Box': { id: 'hackthebox', color: '#9FEF00' },
    'MDN': { id: 'mdn', color: '#000' },
    'Codecademy': { id: 'codecademy', color: '#1F4056' },
  };

  const uniqueProviders = [...new Set(providers)];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {uniqueProviders.map((provider) => {
        const data = partnerData[provider] || { id: provider.toLowerCase().replace(/\s+/g, '-'), color: '#666' };
        return (
          <button
            key={provider}
            onClick={() => navigate(`/partners/${data.id}`)}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-colors cursor-pointer"
            title={`Vezi cursurile ${provider}`}
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
          </button>
        );
      })}
    </div>
  );
}
