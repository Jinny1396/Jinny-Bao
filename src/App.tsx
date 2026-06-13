import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  MapPin, 
  Music, 
  Utensils, 
  Check, 
  Calendar, 
  ArrowRight, 
  Heart, 
  Map as MapIcon,
  ChevronDown,
  Info,
  Phone,
  Volume2,
  VolumeX,
  Compass,
  Smile,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  LogOut,
  Search,
  Filter,
  Upload,
  Image
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { translations, type Translations } from './translations';
// @ts-ignore
import defaultHeroImage from './assets/images/regenerated_image_1780219137505.jpg';

// Define target wedding date: Saturday, Oct 10, 2026 at 4:00 PM
const WEDDING_DATE = new Date('2026-10-10T16:00:00').getTime();

// Beautiful, hand-drawn Eucalyptus Spig Left SVG
const EucalyptusLeft = () => (
  <svg 
    viewBox="0 0 200 400" 
    className="w-48 md:w-64 h-auto pointer-events-none opacity-20 md:opacity-30 stroke-earth-accent fill-none stroke-[1.2]"
    aria-hidden="true"
  >
    {/* Main stem */}
    <path d="M 30,370 C 50,300 80,180 140,50" />
    {/* Leaves */}
    <path d="M 50,320 C 20,310 10,290 20,270 C 35,250 55,270 58,295 Z" />
    <path d="M 58,295 C 62,310 50,320 50,320" />
    
    <path d="M 68,260 C 90,250 105,260 100,285 C 95,305 75,300 68,280" />
    
    <path d="M 80,210 C 60,190 45,170 60,150 C 75,130 95,155 92,185 Z" />
    
    <path d="M 96,165 C 120,150 140,165 135,190 C 130,210 105,200 96,180" />
    
    <path d="M 112,120 C 100,90 90,70 105,60 C 120,50 135,75 125,100 Z" />
    
    <path d="M 124,90 C 150,85 160,105 150,125 C 135,140 120,115 124,90" />
    
    <path d="M 135,55 C 145,30 135,20 125,30 C 115,40 125,50 135,55 Z" />
    
    {/* Subtle shading details */}
    <path d="M 28,290 Q 20,280 32,275" />
    <path d="M 78,275 Q 85,280 82,270" />
    <path d="M 68,170 Q 60,160 70,155" />
    <path d="M 115,110 Q 110,95 120,95" />
  </svg>
);

// Elegant Olive Branch Right SVG
const OliveBranchRight = () => (
  <svg 
    viewBox="0 0 200 400" 
    className="w-48 md:w-64 h-auto pointer-events-none opacity-20 md:opacity-30 stroke-earth-accent fill-none stroke-[1.2]"
    aria-hidden="true"
  >
    {/* Main stem */}
    <path d="M 170,360 C 150,290 110,170 50,60" />
    {/* Olive leaves & fruit */}
    {/* Left leaf 1 */}
    <path d="M 148,300 C 110,295 95,275 110,260 C 125,245 140,265 141,282 Z" />
    <path d="M 141,282 C 143,290 148,300 148,300" />
    
    {/* Seed/Olive */}
    <ellipse cx="140" cy="240" rx="6" ry="10" transform="rotate(20 140 240)" className="fill-olive-drab opacity-40" />
    <path d="M 138,230 C 145,232 143,248 138,250" />

    {/* Right leaf 1 */}
    <path d="M 130,240 C 160,225 175,235 168,255 C 160,270 140,260 130,240" />

    {/* Left leaf 2 */}
    <path d="M 105,190 C 70,185 60,165 75,150 C 90,135 102,155 102,175 Z" />

    {/* Seed/Olive 2 */}
    <ellipse cx="90" cy="130" rx="5" ry="9" transform="rotate(-30 90 130)" className="fill-olive-drab opacity-30" />

    {/* Right leaf 2 */}
    <path d="M 92,150 C 120,130 130,140 125,160 C 118,175 100,165 92,150" />

    {/* Left leaf 3 */}
    <path d="M 72,110 C 45,100 40,85 52,75 C 65,65 74,80 72,98 Z" />

    {/* Tip Leaf */}
    <path d="M 52,65 C 35,45 42,35 50,42 C 58,50 56,60 52,65" />
  </svg>
);

// High-end minimalist floral accent
const MinimalRoseDetail = () => (
  <svg 
    viewBox="0 0 120 120" 
    className="w-20 md:w-28 h-auto opacity-15 stroke-earth-accent fill-none stroke-[0.8]"
    aria-hidden="true"
  >
    <path d="M 60,60 C 50,45 40,40 30,50 C 20,60 30,70 45,65 C 30,75 25,85 35,95 C 45,105 55,90 55,75 C 60,95 70,105 80,95 Q 90,85 85,75 C 70,65 C 85,70 95,60 85,50 C 75,40 65,45 55,60 Z" />
    <path d="M 60,60 C 65,55 70,45 65,35 C 60,25 50,30 55,45" />
    <circle cx="60" cy="61" r="3" className="fill-earth-accent" />
  </svg>
);

// High-end custom parallax scroll wrapper for individual elements
interface ParallaxItemProps {
  className?: string;
  speed: number; // e.g. -0.05 to 0.05
  children: React.ReactNode;
}

const ParallaxItem: React.FC<ParallaxItemProps> = ({ className = '', speed, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleParallax = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate distanceFromCenter from the viewport middle
      const itemCenter = rect.top + rect.height / 2;
      const viewCenter = windowHeight / 2;
      const distanceFromCenter = itemCenter - viewCenter;
      
      // Calculate dynamic offset based on scroll position relative to viewport
      setYOffset(distanceFromCenter * speed);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleParallax);
        ticking = true;
      }
    };

    // Calculate immediately on mount
    handleParallax();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed]);

  return (
    <div 
      ref={ref} 
      className={className} 
      style={{ transform: `translateY(${yOffset}px)`, transition: 'transform 0.15s cubic-bezier(0.1, 0.8, 0.2, 1)' }}
    >
      {children}
    </div>
  );
};

// High-end off-white textured embossed double-swan wax-seal component
const SwanSeal: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className} w-20 h-20 sm:w-24 sm:h-24 select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform duration-300`}>
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
        <defs>
          <radialGradient id="sealGrad" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#FAF8F5" />
            <stop offset="85%" stopColor="#E6E0D8" />
            <stop offset="100%" stopColor="#D4CABE" />
          </radialGradient>
          <filter id="embossFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="-0.4" dy="-0.4" stdDeviation="0.4" floodColor="#ffffff" floodOpacity="0.95" />
            <feDropShadow dx="0.6" dy="0.6" stdDeviation="0.6" floodColor="#8B7E74" floodOpacity="0.32" />
          </filter>
        </defs>
        
        {/* Outer Circle with textured paper gradient */}
        <circle cx="50" cy="50" r="45" fill="url(#sealGrad)" />
        
        {/* Fine concentric dashed rim */}
        <circle cx="50" cy="50" r="40" stroke="#CDBCAC" strokeWidth="0.8" strokeDasharray="1.5,2.5" opacity="0.65" />
        
        {/* Inner raised design (swans & heart) */}
        <g filter="url(#embossFilter)" opacity="0.8">
          {/* Heart frame border */}
          <path 
            d="M 50 24 C 42 16, 26 22, 28 38 C 30 50, 44 60, 50 66 C 56 60, 70 50, 72 38 C 74 22, 58 16, 50 24 Z" 
            stroke="#BCADA0" 
            strokeWidth="1.2" 
            fill="none" 
          />
          
          {/* Left Swan */}
          <path 
            d="M 42 46 C 43.5 42.5, 42 38, 44 36 C 44.8 35, 46 35.5, 45.5 36.8 C 44.5 38.5, 45.2 40, 46 41 C 47.5 42.5, 48.2 44.5, 48 46.8 C 47.8 50, 44.5 51, 42 51 C 38 51, 36.2 48.5, 37.5 46.5 C 39 44.2, 41.8 43.8, 43.5 44.8 C 41 46, 39.5 47.8, 39.8 49.2 C 40 49.8, 40.8 50.2, 41.4 49.8 C 42.2 49.2, 43 48, 42.8 47"
            stroke="#BCADA0" 
            strokeWidth="0.9" 
            strokeLinecap="round"
            fill="none" 
          />

          {/* Right Swan (Mirrored) */}
          <path 
            d="M 58 46 C 56.5 42.5, 58 38, 56 36 C 55.2 35, 54 35.5, 54.5 36.8 C 55.5 38.5, 54.8 40, 54 41 C 52.5 42.5, 51.8 44.5, 52 46.8 C 52.2 50, 55.5 51, 58 51 C 62 51, 63.8 48.5, 62.5 46.5 C 61 44.2, 58.2 43.8, 56.5 44.8 C 59 46, 60.5 47.8, 60.2 49.2 C 60 49.8, 59.2 50.2, 58.6 49.8 C 57.8 49.2, 57 48, 57.2 47"
            stroke="#BCADA0" 
            strokeWidth="0.9" 
            strokeLinecap="round"
            fill="none" 
          />
          
          <circle cx="50" cy="73" r="1" fill="#BCADA0" />
          <path d="M 44 70 C 46 71.2, 48 72.2, 50 73 C 52 72.2, 54 71.2, 56 70" stroke="#BCADA0" strokeWidth="0.6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

// Exquisite Polaroid card with shadow and natural paper tilt
interface PolaroidProps {
  src: string;
  alt: string;
  landscape?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Polaroid: React.FC<PolaroidProps> = ({ src, alt, landscape = false, className = '', children }) => {
  return (
    <div className={`p-3 pb-8 sm:p-4 sm:pb-12 bg-[#FAF8F5] border border-black/[0.03] shadow-[0_12px_36px_rgba(42,42,42,0.06)] hover:shadow-[0_20px_48px_rgba(42,42,42,0.09)] transition-all duration-500 rounded-xs select-none relative flex flex-col ${className}`}>
      <div className={`relative w-full overflow-hidden ${landscape ? 'aspect-[4/3]' : 'aspect-[3/4]'} bg-[#EDEAE5] rounded-xs`}>
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover grayscale-[8%] hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-x-0 bottom-0 top-0 ring-1 ring-inset ring-black/[0.04] rounded-xs pointer-events-none" />
      </div>
      {children}
    </div>
  );
};

// Ambient Falling Petal Component
interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speedY: number;
  speedX: number;
  scale: number;
}

interface ImageAssetFieldProps {
  title: string;
  description: string;
  currentValue: string;
  fallbackValue: string;
  onChange: (val: string) => void;
  recommendedPaths: string[];
  onUploadClick: () => void;
  uploadState?: { isUploading: boolean; progress: number; error?: string };
}

const ImageAssetField: React.FC<ImageAssetFieldProps> = ({
  title,
  description,
  currentValue,
  fallbackValue,
  onChange,
  recommendedPaths,
  onUploadClick,
  uploadState,
}) => {
  const activeImage = currentValue || fallbackValue;

  return (
    <div className="bg-white border border-earth-dark/5 p-4 sm:p-5 rounded-2xl flex flex-col gap-4 text-left shadow-xs transition-all duration-200 hover:border-earth-dark/10">
      <div>
        <span className="font-sans text-[10px] font-bold tracking-wider text-earth-accent uppercase block mb-1">
          {title}
        </span>
        <p className="font-sans text-[11px] text-[#A39E93] leading-relaxed select-text">
          {description}
        </p>
      </div>

      <div className="flex gap-4 items-stretch sm:items-center flex-col sm:flex-row">
        {/* Dynamic Image Preview Thumbnail */}
        <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-stone-100 border border-neutral-200/40 shrink-0 self-center">
          {activeImage ? (
            <img 
              src={activeImage} 
              alt={title} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Return clean fallback if the custom user path is broken
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-stone-400">
              <span className="text-[10px] font-sans">No Image</span>
            </div>
          )}
        </div>

        {/* Path configuration inputs and presets */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex gap-2 items-center">
            <input 
              type="text"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`e.g. ${recommendedPaths[0]}`}
              className="flex-1 rounded-xl border border-stone-200 bg-[#FAF8F5] px-3.5 py-2 text-xs font-sans text-earth-dark focus:border-olive-drab focus:outline-none placeholder:text-stone-400 shadow-inner"
            />
            <button
              type="button"
              onClick={onUploadClick}
              disabled={uploadState?.isUploading}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-earth-accent/10 hover:bg-earth-accent/20 text-earth-dark text-[11px] font-semibold tracking-wider font-sans transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-50"
              title="Upload image using Cloudinary Widget"
            >
              <Upload size={12} className="text-earth-accent" />
              <span>Upload</span>
            </button>
          </div>

          {uploadState?.isUploading && (
            <div className="w-full mt-1 px-1">
              <div className="flex justify-between items-center text-[10px] font-sans text-stone-500 mb-1 animate-pulse">
                <span>Uploading to Cloudinary...</span>
                <span>{uploadState.progress}%</span>
              </div>
              <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-olive-drab transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadState?.error && (
            <p className="text-[10px] text-red-600 font-sans mt-0.5 px-1">
              ⚠️ {uploadState.error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] uppercase tracking-wider font-sans text-stone-400 select-none mr-1">
              Quick Suggestions:
            </span>
            {recommendedPaths.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => onChange(path)}
                className={`text-[9.5px] font-sans px-2.5 py-1 rounded transition-all duration-150 cursor-pointer ${
                  currentValue === path 
                    ? 'bg-olive-drab text-white font-medium' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {path.split('/').pop()}
              </button>
            ))}
            
            {currentValue && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[9.5px] font-sans px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 ml-auto cursor-pointer"
                title="Revert back to default fallback illustration"
              >
                Clear (Fallback)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<'ENG' | 'VIE'>(() => {
    return (localStorage.getItem('BAO_JOHN_LANG') as 'ENG' | 'VIE') || 'ENG';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'ENG' ? 'VIE' : 'ENG';
    setLang(nextLang);
    localStorage.setItem('BAO_JOHN_LANG', nextLang);
  };

  const [siteContent, setSiteContent] = useState<Record<'ENG' | 'VIE', Translations>>(translations);
  const [heroImageUrl, setHeroImageUrl] = useState<string>(defaultHeroImage);
  const [leftPortraitUrl, setLeftPortraitUrl] = useState<string>('https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600');
  const [rightPortraitUrl, setRightPortraitUrl] = useState<string>('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600');
  const [dressCodeImageUrl, setDressCodeImageUrl] = useState<string>('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600');
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#DECCA6', // Sand/Gold
    '#C0A080', // Taupe/Beige
    '#8A9A86', // Sage Green
    '#5E6B5C', // Forest Green
    '#3D3B36'  // Earth Dark
  ]);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(true);

  // States for CMS Panel in Admin view
  const [adminTab, setAdminTab] = useState<'rsvps' | 'cms' | 'images'>('rsvps');
  const [cmsLang, setCmsLang] = useState<'ENG' | 'VIE'>('ENG');
  const [cmsSection, setCmsSection] = useState<'hero' | 'details' | 'map' | 'story' | 'rsvp' | 'thankyou' | 'utils' | 'dresscode'>('hero');
  const [cmsTranslations, setCmsTranslations] = useState<Record<'ENG' | 'VIE', Translations>>(translations);
  const [cmsImageUrl, setCmsImageUrl] = useState<string>(defaultHeroImage);
  const [cmsLeftPortraitUrl, setCmsLeftPortraitUrl] = useState<string>('https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600');
  const [cmsRightPortraitUrl, setCmsRightPortraitUrl] = useState<string>('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600');
  const [cmsDressCodeImageUrl, setCmsDressCodeImageUrl] = useState<string>('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600');
  const [cmsMapImageUrl, setCmsMapImageUrl] = useState<string>('');
  const [cmsPaletteColors, setCmsPaletteColors] = useState<string[]>([
    '#DECCA6',
    '#C0A080',
    '#8A9A86',
    '#5E6B5C',
    '#3D3B36'
  ]);

  // Cloudinary Integration States
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState<string>('dcgtz1nwr');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState<string>('wedding_unsigned_preset');
  const [uploadStates, setUploadStates] = useState<Record<string, { isUploading: boolean; progress: number; error: string }>>({});

  useEffect(() => {
    const scriptId = 'cloudinary-upload-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [isSavingContent, setIsSavingContent] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');

  const t = siteContent[lang];

  // Dynamic procedural map generator based on coordinates / labels
  const parseCoords = (coordStr: string) => {
    const matches = coordStr ? coordStr.match(/[-+]?[0-9]*\.?[0-9]+/g) : null;
    if (matches && matches.length >= 2) {
      const lat = parseFloat(matches[0]);
      const lng = parseFloat(matches[1]);
      return { lat, lng };
    }
    return { lat: 45.4192, lng: -122.1824 };
  };

  const { lat: mapLat, lng: mapLng } = parseCoords(t.mapCoordinates);
  const mapSeed = (Math.abs(mapLat) * 1000 + Math.abs(mapLng) * 10000) % 99999;

  const getSeededValue = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const x1 = getSeededValue(mapSeed + 1, 130, 195);
  const y1 = getSeededValue(mapSeed + 2, 160, 240);

  const x2 = getSeededValue(mapSeed + 3, 290, 365);
  const y2 = getSeededValue(mapSeed + 4, 110, 180);

  const riverC1X = getSeededValue(mapSeed + 5, 80, 220);
  const riverC1Y = getSeededValue(mapSeed + 6, 260, 330);
  const riverC2X = getSeededValue(mapSeed + 7, 240, 320);
  const riverC2Y = getSeededValue(mapSeed + 8, 80, 170);

  const riverPath = `M -20,${getSeededValue(mapSeed + 9, 340, 380)} C ${riverC1X},${riverC1Y} ${riverC2X},${riverC2Y} 520,${getSeededValue(mapSeed + 10, 20, 60)}`;

  const roadC1X = getSeededValue(mapSeed + 11, 100, 180);
  const roadC1Y = getSeededValue(mapSeed + 12, 220, 300);
  const roadC2X = getSeededValue(mapSeed + 13, 225, 315);
  const roadC2Y = getSeededValue(mapSeed + 14, 100, 160);

  const roadPath = `M ${getSeededValue(mapSeed + 15, 100, 140)},420 C ${roadC1X},${roadC1Y} ${roadC2X},${roadC2Y} ${getSeededValue(mapSeed + 16, 310, 350)},-20`;

  const path1 = `M ${x1},${y1} Q ${getSeededValue(mapSeed + 17, 200, 280)},${getSeededValue(mapSeed + 18, 140, 210)} ${x2},${y2}`;

  const contours = [
    `M 10,250 C ${120 + getSeededValue(mapSeed + 19, -40, 40)},${220 + getSeededValue(mapSeed + 20, -30, 30)} 250,300 490,260`,
    `M 10,120 C ${150 + getSeededValue(mapSeed + 21, -30, 30)},${110 + getSeededValue(mapSeed + 22, -20, 20)} 300,100 490,140`
  ];

  const pines: {x: number, y: number, scale: number}[] = [];
  for (let i = 0; i < 7; i++) {
    const pX = getSeededValue(mapSeed + 100 + i, 30, 475);
    const pY = getSeededValue(mapSeed + 200 + i, 40, 360);
    
    const distL1 = Math.sqrt((pX - x1)**2 + (pY - y1)**2);
    const distL2 = Math.sqrt((pX - x2)**2 + (pY - y2)**2);
    const distCompass = Math.sqrt((pX - 55)**2 + (pY - 60)**2);
    if (distL1 > 55 && distL2 > 55 && distCompass > 65) {
      pines.push({ x: pX, y: pY, scale: getSeededValue(mapSeed + 300 + i, 0.75, 1.2) });
    }
  }

  useEffect(() => {
    document.title = t.weddingTitle;
  }, [lang, t.weddingTitle]);

  // Fetch dynamic layout site content on mount
  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const docRef = doc(db, 'site_content', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mergedEng = { ...translations.ENG, ...(data.ENG || {}) };
          const mergedVie = { ...translations.VIE, ...(data.VIE || {}) };
          const loadedContent = { ENG: mergedEng, VIE: mergedVie };

          setSiteContent(loadedContent);
          setCmsTranslations(loadedContent);

          const heroImg = data.imageUrl || data.heroBg || '';
          setHeroImageUrl(heroImg || defaultHeroImage);
          setCmsImageUrl(heroImg);

          const leftImg = data.leftPortraitUrl || data.dateLeftPhoto || '';
          setLeftPortraitUrl(leftImg || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600');
          setCmsLeftPortraitUrl(leftImg);

          const rightImg = data.rightPortraitUrl || data.dateRightPhoto || '';
          setRightPortraitUrl(rightImg || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600');
          setCmsRightPortraitUrl(rightImg);

          const dressImg = data.dressCodeImageUrl || data.dressCodeStyleGraphic || '';
          setDressCodeImageUrl(dressImg || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600');
          setCmsDressCodeImageUrl(dressImg);

          const mapImg = data.mapImageUrl || data.venueMapSketchGraphic || '';
          setMapImageUrl(mapImg || '');
          setCmsMapImageUrl(mapImg);

          if (data.paletteColors && Array.isArray(data.paletteColors)) {
            const loadedColors = [...data.paletteColors];
            while (loadedColors.length < 5) loadedColors.push('#CCCCCC');
            const finalColors = loadedColors.slice(0, 5);
            setPaletteColors(finalColors);
            setCmsPaletteColors(finalColors);
          }

          if (data.cloudinaryCloudName) {
            setCloudinaryCloudName(data.cloudinaryCloudName);
          }
          if (data.cloudinaryUploadPreset) {
            setCloudinaryUploadPreset(data.cloudinaryUploadPreset);
          }
        }
      } catch (err) {
        console.error('Error fetching site_content from Firestore on load:', err);
      } finally {
        setIsContentLoading(false);
      }
    };
    fetchSiteContent();
  }, []);

  // Administrative state managers
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('BAO_JOHN_ADMIN_AUTH') === 'true';
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [rsvpsList, setRsvpsList] = useState<any[]>([]);
  const [isFetchingRsvps, setIsFetchingRsvps] = useState(false);
  const [fetchingRsvpsError, setFetchingRsvpsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attending' | 'declined'>('all');

  // Parse URL hash routing to toggle admin view
  useEffect(() => {
    const handleCheckHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminViewActive(true);
      } else {
        setIsAdminViewActive(false);
      }
    };
    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, []);

  // Fetch RSVPs from live Firestore when admin view & auth are active
  const fetchRsvps = async () => {
    setIsFetchingRsvps(true);
    setFetchingRsvpsError('');
    try {
      const querySnapshot = await getDocs(collection(db, 'rsvps'));
      const fetched: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Client-side sort by timestamp descending so the latest submissions are at the top
      fetched.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
      setRsvpsList(fetched);
    } catch (err: any) {
      console.error('Error fetching RSVPs from Firestore: ', err);
      setFetchingRsvpsError(err.message || 'Required query could not be performed or reference collection not initialized.');
    } finally {
      setIsFetchingRsvps(false);
    }
  };

  useEffect(() => {
    if (isAdminViewActive && isAdminAuthenticated) {
      fetchRsvps();
    }
  }, [isAdminViewActive, isAdminAuthenticated]);

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPinInput === '1010' || adminPinInput === '1234') {
      setIsAdminAuthenticated(true);
      setAdminPinError('');
      sessionStorage.setItem('BAO_JOHN_ADMIN_AUTH', 'true');
    } else {
      setAdminPinError('Invalid passcode. Hint: The wedding date of Gia Bao & John (MMDD format: October 10 = 1010).');
      setAdminPinInput('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPinInput('');
    sessionStorage.removeItem('BAO_JOHN_ADMIN_AUTH');
    window.location.hash = '';
  };

  const exportToCsv = () => {
    if (rsvpsList.length === 0) return;
    
    const headers = ['Guest Name', 'Attendance', 'Meal Selection', 'Dietary Requirements', 'Song Request', 'Message/Greeting', 'Submission Date'];
    const rows = rsvpsList.map(item => [
      item.name || '',
      item.attendance || '',
      item.meal || 'N/A',
      item.dietary || '',
      item.songRequest || '',
      item.greeting ? item.greeting.replace(/\n/g, ' ') : '',
      item.timestamp || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gia_bao_john_wedding_rsvps_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateCmsField = (key: keyof Translations, value: string) => {
    setCmsTranslations((prev) => ({
      ...prev,
      [cmsLang]: {
        ...prev[cmsLang],
        [key]: value,
      },
    }));
  };



  const handleSaveCmsContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    setSaveStatus('saving');
    setSaveErrorMessage('');

    try {
      const docRef = doc(db, 'site_content', 'main');
      await setDoc(docRef, {
        ENG: cmsTranslations.ENG,
        VIE: cmsTranslations.VIE,
        imageUrl: cmsImageUrl,
        heroBg: cmsImageUrl,
        leftPortraitUrl: cmsLeftPortraitUrl,
        dateLeftPhoto: cmsLeftPortraitUrl,
        rightPortraitUrl: cmsRightPortraitUrl,
        dateRightPhoto: cmsRightPortraitUrl,
        dressCodeImageUrl: cmsDressCodeImageUrl,
        dressCodeStyleGraphic: cmsDressCodeImageUrl,
        mapImageUrl: cmsMapImageUrl,
        venueMapSketchGraphic: cmsMapImageUrl,
        paletteColors: cmsPaletteColors,
        cloudinaryCloudName,
        cloudinaryUploadPreset,
        updatedAt: new Date().toISOString(),
      });

      // Update active live states of the landing page
      setSiteContent(cmsTranslations);
      setHeroImageUrl(cmsImageUrl);
      setLeftPortraitUrl(cmsLeftPortraitUrl);
      setRightPortraitUrl(cmsRightPortraitUrl);
      setDressCodeImageUrl(cmsDressCodeImageUrl);
      setMapImageUrl(cmsMapImageUrl);
      setPaletteColors(cmsPaletteColors);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error saving site content to Firestore:', err);
      setSaveStatus('error');
      setSaveErrorMessage(err.message || 'Write permission has been denied or firestore rules rejected the push.');
    } finally {
      setIsSavingContent(false);
    }
  };

  const openCloudinaryUploader = (targetKey: 'hero' | 'left' | 'right' | 'dress' | 'map') => {
    const cloudinaryObj = (window as any).cloudinary;
    if (!cloudinaryObj) {
      alert('The Cloudinary script is loading or failed to load. Please make sure you have internet access and refresh the page to load the uploader widget.');
      return;
    }

    setUploadStates(prev => ({
      ...prev,
      [targetKey]: { isUploading: true, progress: 0, error: '' }
    }));

    const widget = cloudinaryObj.createUploadWidget(
      {
        cloudName: cloudinaryCloudName,
        uploadPreset: cloudinaryUploadPreset,
        theme: 'minimal',
        styles: {
          palette: {
            window: '#FAF8F5',
            windowBorder: '#DECCA6',
            tabIcon: '#5E6B5C',
            menuIcons: '#5E6B5C',
            textDark: '#3D3B36',
            textLight: '#FFFFFF',
            link: '#8A9A86',
            action: '#5E6B5C',
            inactiveTabIcon: '#A39E93',
            error: '#B91C1C',
            inProgress: '#8A9A86',
            complete: '#5E6B5C',
            sourceBg: '#FAF8F5'
          }
        },
        multiple: false,
        clientAllowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
        maxFileSize: 30 * 1024 * 1024,
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary Widget Error:', error);
          setUploadStates(prev => ({
            ...prev,
            [targetKey]: { isUploading: false, progress: 0, error: error.message || 'Load failure' }
          }));
          return;
        }

        if (result && result.event === 'upload-progress') {
          const progressValue = result.info.progress || 0;
          setUploadStates(prev => ({
            ...prev,
            [targetKey]: { isUploading: true, progress: progressValue, error: '' }
          }));
        }

        if (result && result.event === 'success') {
          const url = result.info.secure_url;
          
          if (targetKey === 'hero') setCmsImageUrl(url);
          else if (targetKey === 'left') setCmsLeftPortraitUrl(url);
          else if (targetKey === 'right') setCmsRightPortraitUrl(url);
          else if (targetKey === 'dress') setCmsDressCodeImageUrl(url);
          else if (targetKey === 'map') setCmsMapImageUrl(url);

          setUploadStates(prev => ({
            ...prev,
            [targetKey]: { isUploading: false, progress: 100, error: '' }
          }));

          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.85 }
          });
        }
      }
    );

    widget.open();
  };

  const renderTextInput = (label: string, valueKey: keyof Translations, placeholder: string = '') => {
    return (
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-stone-500 font-sans font-bold text-[10px] tracking-widest uppercase">
          {label}
        </label>
        <input
          type="text"
          value={cmsTranslations[cmsLang][valueKey] || ''}
          placeholder={placeholder}
          onChange={(e) => updateCmsField(valueKey, e.target.value)}
          className="w-full px-4 py-3 bg-white border border-earth-dark/15 focus:outline-none focus:border-olive-drab rounded-xl text-sm text-earth-dark font-sans shadow-sm"
        />
      </div>
    );
  };

  const renderTextAreaInput = (label: string, valueKey: keyof Translations, placeholder: string = '') => {
    return (
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-stone-500 font-sans font-bold text-[10px] tracking-widest uppercase">
          {label}
        </label>
        <textarea
          rows={3}
          value={cmsTranslations[cmsLang][valueKey] || ''}
          placeholder={placeholder}
          onChange={(e) => updateCmsField(valueKey, e.target.value)}
          className="w-full p-4 bg-white border border-earth-dark/15 focus:outline-none focus:border-olive-drab rounded-xl text-sm leading-relaxed text-earth-dark font-serif italic shadow-sm resize-y"
        />
      </div>
    );
  };

  const [activeSection, setActiveSection] = useState<'hero' | 'details' | 'story' | 'dress-code' | 'rsvp'>('hero');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState<number>(1);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [rsvpState, setRsvpState] = useState({
    name: '',
    attendance: 'attending', // attending | declined
    meal: 'woodfired-trout',
    dietary: '',
    songRequest: '',
    greeting: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound effect / ambient generator for that sensory 'Eothen' feeling
  // We utilize a simple web audio API synth loop when the user toggles atmospheric audio!
  const synthIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startAmbientSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const playAtmosphere = () => {
        // High quality warm ambient pulse sounds (nature aesthetic)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Soft organic tonic frequencies (F major / C major soft pentatonic scale for zen atmosphere)
        const harmonies = [174.61, 261.63, 329.63, 392.00, 523.25];
        const randomNote = harmonies[Math.floor(Math.random() * harmonies.length)];
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(randomNote, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 3);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 8);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 8.5);
      };

      playAtmosphere();
      const interval = window.setInterval(playAtmosphere, 4500);
      synthIntervalRef.current = interval;
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn("Audio Context failed to boot.", e);
    }
  };

  const stopAmbientSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    setIsPlayingAudio(false);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAmbientSynth();
    } else {
      startAmbientSynth();
    }
  };

  // Implement Countdown Timer Logic
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = WEDDING_DATE - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days: d, hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set up falling rose/eucalyptus petal animation for the celebratory thank you flow
  useEffect(() => {
    if (isSubmitted) {
      const initialPetals: Petal[] = Array.from({ length: 45 }).map((_, index) => ({
        id: index,
        x: Math.random() * window.innerWidth,
        y: -100 - Math.random() * 500,
        rotation: Math.random() * 360,
        speedY: 1.2 + Math.random() * 2.5,
        speedX: -1 + Math.random() * 2,
        scale: 0.6 + Math.random() * 0.8
      }));
      setPetals(initialPetals);

      let animId: number;
      const animatePetals = () => {
        setPetals(prev => 
          prev.map(p => {
            let nextY = p.y + p.speedY;
            let nextX = p.x + p.speedX + Math.sin(nextY / 30) * 0.8;
            let nextRot = p.rotation + p.speedX * 0.5;

            // Loop petals back to top for continuous elegant breeze
            if (nextY > window.innerHeight + 100) {
              nextY = -100;
              nextX = Math.random() * window.innerWidth;
            }

            return {
              ...p,
              y: nextY,
              x: nextX,
              rotation: nextRot
            };
          })
        );
        animId = requestAnimationFrame(animatePetals);
      };

      animId = requestAnimationFrame(animatePetals);
      return () => cancelAnimationFrame(animId);
    }
  }, [isSubmitted]);

  // Interaction Intersection Observer and parallax fade for hero text with requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      // 1. Update Roman numeral highlighters
      const sections = ['hero', 'details', 'story', 'dress-code', 'rsvp'] as const;
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }

      // 2. Calculate hero parallax opacity
      const scrollY = window.scrollY;
      const fadeEnd = window.innerHeight * 0.5;
      let opacity = 1 - (scrollY / fadeEnd);
      if (opacity < 0) opacity = 0;
      if (opacity > 1) opacity = 1;
      setHeroOpacity(opacity);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // RSVP submission function
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpState.name.trim()) return;

    setIsSubmitting(true);
    
    const timestampIso = new Date().toISOString();
    // Generate a valid document ID (alphanumeric and dashes only, obeying isValidId rule)
    const sanitizedName = rsvpState.name.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    const rsvpId = (sanitizedName || 'guest') + '-' + Math.floor(Math.random() * 1000000);

    // Prepare payload precisely matching the schema in firebase-blueprint.json
    const rsvpPayload: Record<string, string> = {
      name: rsvpState.name.trim(),
      attendance: rsvpState.attendance,
      timestamp: timestampIso
    };

    if (rsvpState.attendance === 'attending') {
      if (rsvpState.meal) rsvpPayload.meal = rsvpState.meal;
      if (rsvpState.dietary.trim()) rsvpPayload.dietary = rsvpState.dietary.trim();
      if (rsvpState.songRequest.trim()) rsvpPayload.songRequest = rsvpState.songRequest.trim();
    }
    if (rsvpState.greeting.trim()) {
      rsvpPayload.greeting = rsvpState.greeting.trim();
    }

    try {
      // Direct Firestore write
      const rsvpDocRef = doc(db, 'rsvps', rsvpId);
      await setDoc(rsvpDocRef, rsvpPayload);

      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Sophisticated champagne-gold confetti spray from both margins
      const duration = 4.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        // Gold parameters matching "Quiet Gold" luxury design
        const goldColors = ['#E6C07B', '#C5A059', '#D4AF37', '#FAF9F6', '#6E685E'];
        
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.85 },
          colors: goldColors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.85 },
          colors: goldColors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Persist client RSVP automatically
      localStorage.setItem('GIA_BAO_JOHN_RSVP', JSON.stringify({
        ...rsvpState,
        timestamp: timestampIso
      }));
    } catch (error) {
      setIsSubmitting(false);
      // Converts permission errors into diagnostics for the build/linter environment as per guidelines
      handleFirestoreError(error, OperationType.CREATE, `rsvps/${rsvpId}`);
    }
  };

  const resetRsvp = () => {
    setIsSubmitted(false);
    setRsvpState({
      name: '',
      attendance: 'attending',
      meal: 'woodfired-trout',
      dietary: '',
      songRequest: '',
      greeting: ''
    });
  };

  // Convert numbers to Roman numerals for the countdown style or sidebar labels
  const formatToRoman = (num: number) => {
    if (num <= 0) return 'O';
    const romanMap = [
      { val: 100, label: 'C' },
      { val: 90, label: 'XC' },
      { val: 50, label: 'L' },
      { val: 40, label: 'XL' },
      { val: 10, label: 'X' },
      { val: 9, label: 'IX' },
      { val: 5, label: 'V' },
      { val: 4, label: 'IV' },
      { val: 1, label: 'I' }
    ];
    let result = '';
    let remaining = num;
    for (const match of romanMap) {
      while (remaining >= match.val) {
        result += match.label;
        remaining -= match.val;
      }
    }
    return result;
  };

  if (isAdminViewActive) {
    return (
      <div id="admin-portal-container" className="paper-texture relative min-h-screen bg-raw-earth text-earth-dark antialiased select-text">
        {/* Floating background leaves */}
        <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
          <EucalyptusLeft />
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none scale-x-[-1]">
          <EucalyptusLeft />
        </div>

        {!isAdminAuthenticated ? (
          // PASSCODE PASSWORD ACCESS PROMPT CONTROL PANEL
          <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md bg-stone-100/40 backdrop-blur-sm border border-earth-dark/10 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden"
            >
              {/* Minimalist key icon decoration */}
              <div className="flex justify-center mb-6 text-earth-accent text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-earth-dark/15 text-earth-accent bg-raw-earth/50">
                  <Lock size={20} className="stroke-[1.5]" />
                </div>
              </div>

              <h2 className="font-serif text-3xl font-light text-center text-earth-dark leading-tight mb-2 select-text">
                Registry Logbook
              </h2>
              <p className="font-sans text-[10px] tracking-[0.255em] text-center text-[#6E6A5F] uppercase mb-8">
                Gia Bao &amp; John
              </p>

              <form onSubmit={handleVerifyPin} className="space-y-6">
                <div>
                  <label htmlFor="admin-pin" className="block text-[10px] tracking-widest font-sans font-semibold uppercase text-earth-accent text-center mb-3">
                    Enter Admin Access PIN
                  </label>
                  <div className="flex justify-center gap-3 my-4">
                    {/* Visual indicators of PIN length */}
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                          adminPinInput.length > idx
                            ? 'bg-earth-dark border-earth-dark scale-110'
                            : 'border-earth-dark/20 bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  <input
                    id="admin-pin"
                    type="password"
                    maxLength={4}
                    value={adminPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAdminPinInput(val);
                      setAdminPinError('');
                    }}
                    placeholder="••••"
                    className="w-full text-center py-3 bg-transparent border-b border-earth-dark/25 font-mono text-xl tracking-[0.5em] text-earth-dark placeholder-neutral-300 focus:outline-none focus:border-olive-drab transition-colors"
                    autoFocus
                  />
                  {adminPinError && (
                    <p className="text-xs text-red-600 font-serif italic text-center mt-3 leading-relaxed">{adminPinError}</p>
                  )}
                </div>

                {/* Tactical PIN Keyboard Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-[210px] mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (adminPinInput.length < 4) {
                          setAdminPinInput((prev) => prev + num);
                          setAdminPinError('');
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-full border border-earth-dark/10 hover:bg-earth-dark/5 active:bg-earth-dark/10 text-sm font-sans font-medium text-earth-dark cursor-pointer transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPinInput('');
                      setAdminPinError('');
                    }}
                    className="text-[10px] font-sans tracking-widest text-[#6E6A5F] hover:text-earth-dark cursor-pointer text-center"
                  >
                    CLEAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (adminPinInput.length < 4) {
                        setAdminPinInput((prev) => prev + '0');
                        setAdminPinError('');
                      }
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-earth-dark/10 hover:bg-earth-dark/5 active:bg-earth-dark/10 text-sm font-sans font-medium text-earth-dark cursor-pointer transition-colors"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPinInput((prev) => prev.slice(0, -1));
                      setAdminPinError('');
                    }}
                    className="text-[10px] font-sans tracking-widest text-[#6E6A5F] hover:text-earth-dark cursor-pointer text-center"
                  >
                    DEL
                  </button>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-earth-dark text-raw-earth hover:bg-earth-dark/95 transition-all duration-300 font-sans text-xs tracking-widest font-semibold cursor-pointer"
                  >
                    <Unlock size={13} />
                    <span>VERIFY &amp; OPEN LOGBOOK</span>
                  </button>
                  
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = '';
                    }}
                    className="text-center text-[10px] tracking-widest font-sans font-semibold uppercase text-earth-accent hover:text-earth-dark transition-colors pt-2"
                  >
                    RETURN TO WEBSITE
                  </a>
                </div>
              </form>
            </motion.div>
          </div>
        ) : (
          // RSVP DATA COLLECTION VIEW
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-text">
            {/* Header section with back button and export buttons */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-earth-dark/10 pb-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-olive-drab animate-pulse" />
                  <span className="font-sans text-[10px] tracking-[0.3em] text-earth-accent uppercase block font-semibold">
                    SECURED ADMINISTRATIVE PORTAL
                  </span>
                </div>
                <div className="font-serif text-4xl font-light text-earth-dark select-text">
                  The Guestbook Registry
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-1 italic font-serif select-text">
                  Gia Bao &amp; John Union • Saturday, October 10, 2026
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchRsvps}
                  disabled={isFetchingRsvps}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-earth-dark/15 hover:bg-earth-dark/5 transition-all font-sans text-[11px] tracking-widest font-semibold text-earth-dark disabled:opacity-55 disabled:cursor-wait cursor-pointer bg-white/40 shadow-xs"
                  title="Reload Live Submissions"
                >
                  <RefreshCw size={13} className={isFetchingRsvps ? 'animate-spin' : ''} />
                  <span>REFRESH DATA</span>
                </button>

                <button
                  onClick={exportToCsv}
                  disabled={rsvpsList.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 transition-all font-sans text-[11px] tracking-widest font-semibold text-earth-accent disabled:opacity-40 cursor-pointer"
                  title="Download CSV Worksheet"
                >
                  <Download size={13} />
                  <span>EXPORT CSV</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-dark hover:bg-earth-dark/90 text-raw-earth transition-all font-sans text-[11px] tracking-widest font-semibold cursor-pointer shadow-md"
                  title="Lock Session and Exit"
                >
                  <LogOut size={13} />
                  <span>EXIT PORTAL</span>
                </button>
              </div>
            </header>

            {/* Sub-navigation Tab Selector */}
            <div className="flex border-b border-earth-dark/10 mb-8 gap-6 overflow-x-auto whitespace-nowrap">
              <button
                type="button"
                onClick={() => setAdminTab('rsvps')}
                className={`pb-3 text-xs tracking-[0.2em] font-sans font-bold uppercase cursor-pointer border-b-2 transition-all duration-300 ${
                  adminTab === 'rsvps'
                    ? 'border-olive-drab text-[#5E5B52]'
                    : 'border-transparent text-[#6E6A5F]/60 hover:text-earth-dark font-medium'
                }`}
              >
                Guest Book RSVPs
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('cms')}
                className={`pb-3 text-xs tracking-[0.2em] font-sans font-bold uppercase cursor-pointer border-b-2 transition-all duration-300 ${
                  adminTab === 'cms'
                    ? 'border-olive-drab text-[#5E5B52]'
                    : 'border-transparent text-[#6E6A5F]/60 hover:text-earth-dark font-medium'
                }`}
              >
                Website Content (CMS)
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('images')}
                className={`pb-3 text-xs tracking-[0.2em] font-sans font-bold uppercase cursor-pointer border-b-2 transition-all duration-300 ${
                  adminTab === 'images'
                    ? 'border-olive-drab text-[#5E5B52]'
                    : 'border-transparent text-[#6E6A5F]/60 hover:text-earth-dark font-medium'
                }`}
              >
                🖼️ Global Image Assets Registry
              </button>
            </div>

            {/* Error alerts if firebase collection can't load */}
            {fetchingRsvpsError && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-red-700 text-sm font-serif italic text-center">
                <p className="font-semibold">Unable to fetch wedding registries:</p>
                <p className="text-xs opacity-90 mt-1 font-mono">{fetchingRsvpsError}</p>
              </div>
            )}

            {adminTab === 'rsvps' && (
              <>
                {/* Summary KPI Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card 1: Total registrations */}
              <div className="bg-white/50 backdrop-blur-sm border border-earth-dark/5 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <span className="font-sans text-[9px] tracking-[0.25em] text-[#6E6A5F] uppercase block mb-1 font-semibold">
                  TOTAL REGISTERS LOGGED
                </span>
                <p className="font-serif text-3xl font-light text-earth-dark select-text">
                  {rsvpsList.length}
                </p>
                <p className="text-[10px] text-neutral-400 mt-2 font-serif italic">
                  Unique submitted forms
                </p>
              </div>

              {/* Card 2: Attending Count */}
              <div className="bg-white/50 backdrop-blur-sm border border-earth-dark/5 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <span className="font-sans text-[9px] tracking-[0.25em] text-olive-drab uppercase block mb-1 font-semibold">
                  GUESTS ATTENDING
                </span>
                <p className="font-serif text-3xl font-light text-olive-drab select-text">
                  {rsvpsList.filter(r => r.attendance === 'attending').length}
                </p>
                {/* Visual meter */}
                <div className="w-full bg-neutral-200/70 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-olive-drab h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${rsvpsList.length ? (rsvpsList.filter(r => r.attendance === 'attending').length / rsvpsList.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Card 3: Declined Count */}
              <div className="bg-white/50 backdrop-blur-sm border border-earth-dark/5 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <span className="font-sans text-[9px] tracking-[0.25em] text-[#6E6A5F] uppercase block mb-1 font-semibold">
                  GUESTS DECLINED
                </span>
                <p className="font-serif text-3xl font-light text-earth-accent/80 select-text">
                  {rsvpsList.filter(r => r.attendance === 'declined').length}
                </p>
                <div className="w-full bg-neutral-200/70 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-earth-accent h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${rsvpsList.length ? (rsvpsList.filter(r => r.attendance === 'declined').length / rsvpsList.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Card 4: Curated Meal tallies */}
              <div className="bg-white/50 backdrop-blur-sm border border-earth-dark/5 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <span className="font-sans text-[9px] tracking-[0.2em] text-[#6E6A5F] uppercase block mb-2 font-semibold">
                  HEARTH COVERS TALLY
                </span>
                <div className="space-y-1.5 text-[11px] font-serif text-neutral-600 select-text">
                  <div className="flex justify-between border-b border-earth-dark/5 pb-1 select-text">
                    <span>Siletz Trout (Fish):</span>
                    <span className="font-mono font-medium">{rsvpsList.filter(r => r.attendance === 'attending' && r.meal === 'woodfired-trout').length}</span>
                  </div>
                  <div className="flex justify-between border-b border-earth-dark/5 pb-1 select-text">
                    <span>Alder Heifer (Beef):</span>
                    <span className="font-mono font-medium">{rsvpsList.filter(r => r.attendance === 'attending' && r.meal === 'cow-heifer').length}</span>
                  </div>
                  <div className="flex justify-between border-b border-earth-dark/5 pb-1 select-text">
                    <span>Mushroom Barley (V):</span>
                    <span className="font-mono font-medium">{rsvpsList.filter(r => r.attendance === 'attending' && r.meal === 'barley-ash').length}</span>
                  </div>
                  <div className="flex justify-between select-text">
                    <span>Pumpkin Crop (VG):</span>
                    <span className="font-mono font-medium">{rsvpsList.filter(r => r.attendance === 'attending' && r.meal === 'raw-greens').length}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Search and filters */}
            <div className="bg-white/40 backdrop-blur-xs border border-earth-dark/5 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6E6A5F]/60">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Filter register ledger by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/70 border border-earth-dark/10 py-2.5 pl-10 pr-4 rounded-xl text-xs font-serif text-earth-dark focus:outline-none focus:border-olive-drab focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-[10px] tracking-widest font-sans font-semibold uppercase text-earth-accent/70 whitespace-nowrap mr-1 flex items-center gap-1.5 selection:bg-transparent">
                  <Filter size={11} />
                  <span>RSVP Status:</span>
                </span>
                
                {[
                  { id: 'all', label: 'All Entries' },
                  { id: 'attending', label: 'Attending' },
                  { id: 'declined', label: 'Declined' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setAttendanceFilter(btn.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans tracking-widest font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      attendanceFilter === btn.id
                        ? 'bg-earth-dark text-raw-earth shadow-xs'
                        : 'border border-earth-dark/10 text-[#6E6A5F] hover:bg-white/60 bg-white/30'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Data Table */}
            <div className="bg-white/50 backdrop-blur-sm border border-earth-dark/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto min-w-full">
                <table className="min-w-full divide-y divide-earth-dark/10 text-left text-xs text-earth-dark">
                  <thead>
                    <tr className="bg-stone-100/50 text-[10px] tracking-widest font-sans font-semibold uppercase text-[#6E6A5F]/80">
                      <th className="py-4 px-6 font-medium">Guest Name</th>
                      <th className="py-4 px-4 font-medium text-center">RSVP Status</th>
                      <th className="py-4 px-4 font-medium">Hearth Platter Selection</th>
                      <th className="py-4 px-4 font-medium">Dietary Requirements</th>
                      <th className="py-4 px-4 font-medium">Dance Acoustic Nomination</th>
                      <th className="py-4 px-6 font-medium">Blessings &amp; Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-dark/5 bg-transparent font-serif italic text-earth-dark/95">
                    {(() => {
                      const filteredList = rsvpsList.filter(item => {
                        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = attendanceFilter === 'all' || item.attendance === attendanceFilter;
                        return matchesSearch && matchesFilter;
                      });

                      if (isFetchingRsvps && rsvpsList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
                              <div className="inline-flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-dashed border-olive-drab rounded-full animate-spin"></div>
                                <p className="font-sans text-xs uppercase tracking-widest text-[#6E6A5F]/70">Accessing collection vaults...</p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      if (filteredList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-16 text-center text-neutral-400 font-serif font-light italic">
                              No compatible RSVP submissions located.
                            </td>
                          </tr>
                        );
                      }

                      return filteredList.map((item) => (
                        <tr key={item.id} className="hover:bg-white/20 transition-all duration-150">
                          {/* Name */}
                          <td className="py-4 px-6 font-sans font-medium text-sm text-earth-dark not-italic">
                            {item.name}
                            <span className="text-[9px] font-mono block text-neutral-400 font-light mt-0.5">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'No date'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center not-italic">
                            {item.attendance === 'attending' ? (
                              <span className="inline-flex items-center gap-1.2 px-2.5 py-1 rounded-full text-[9px] tracking-widest font-sans font-bold bg-olive-light/10 text-olive-drab uppercase">
                                <span className="w-1.2 h-1.2 rounded-full bg-olive-drab" />
                                <span>Attending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.2 px-2.5 py-1 rounded-full text-[9px] tracking-widest font-sans font-bold bg-stone-200/50 text-[#6E6A5F] uppercase">
                                <span className="w-1.2 h-1.2 rounded-full bg-neutral-400" />
                                <span>Declined</span>
                              </span>
                            )}
                          </td>

                          {/* Meal Preference */}
                          <td className="py-4 px-4 font-serif text-sm">
                            {item.attendance === 'attending' ? (
                              <>
                                {item.meal === 'woodfired-trout' && 'Clay Woodfired Trout & Sorrel'}
                                {item.meal === 'cow-heifer' && 'Smoked Alder Ranch Heifer'}
                                {item.meal === 'barley-ash' && 'Mushroom Barley in Ash (V)'}
                                {item.meal === 'raw-greens' && 'Harvest Pumpkins & Herbs (VG)'}
                                {!item.meal && 'Not requested'}
                              </>
                            ) : (
                              <span className="text-neutral-400 font-sans tracking-wider text-[11px]">—</span>
                            )}
                          </td>

                          {/* Dietary Requirements */}
                          <td className="py-4 px-4 text-neutral-700 font-serif text-sm max-w-[140px] truncate" title={item.dietary}>
                            {item.dietary?.trim() ? item.dietary : <span className="text-neutral-400 not-italic text-xs">—</span>}
                          </td>

                          {/* Song Request */}
                          <td className="py-4 px-4 text-neutral-700 font-serif text-sm max-w-[140px] truncate" title={item.songRequest}>
                            {item.songRequest?.trim() ? (
                              <span className="flex items-center gap-1.5 text-olive-drab">
                                <Music size={11} className="shrink-0 stroke-[1.5]" />
                                <span className="italic">{item.songRequest}</span>
                              </span>
                            ) : (
                              <span className="text-neutral-400 not-italic text-xs">—</span>
                            )}
                          </td>

                          {/* Personal blessings journal comments */}
                          <td className="py-4 px-6 text-neutral-600 font-serif text-xs leading-relaxed max-w-xs break-words">
                            {item.greeting?.trim() ? (
                              <span className="block border-l-2 border-[#C5A059]/30 pl-3">“{item.greeting}”</span>
                            ) : (
                              <span className="text-neutral-400 font-serif italic text-xs">No message left</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {adminTab === 'cms' && (
          <div className="grid grid-cols-1 gap-8 mt-4">
            {/* Full Width Column: Web Content Modification Form */}
            <div className="w-full">
              <form onSubmit={handleSaveCmsContent} className="bg-[#FAF8F5]/80 backdrop-blur-xs border border-earth-dark/5 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-earth-dark/5 pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-light text-earth-dark select-text">
                      II. Website Text Templates
                    </h2>
                    <p className="font-sans text-xs text-[#6E6A5F] mt-0.5 select-text">
                      Modify frontend static translations in real-time. Select section category below.
                    </p>
                  </div>

                  {/* Prominent Auto-Save and Firestore Push Trigger Button */}
                  <button
                    type="submit"
                    disabled={isSavingContent}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-olive-drab hover:bg-[#4E4B42] text-white tracking-widest font-sans text-xs font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-md shrink-0 uppercase active:scale-[0.98]"
                  >
                    <Lock size={12} className={isSavingContent ? 'animate-pulse' : ''} />
                    <span>{isSavingContent ? 'TRANSMITTING...' : 'SAVE & PUSH CHANGES'}</span>
                  </button>
                </div>

                {/* Status feedback alerts */}
                {saveStatus === 'saved' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200/50 rounded-xl text-emerald-800 text-sm font-serif italic text-center animate-letter-spacing-unfold">
                    <p className="font-semibold">✓ Site modifications published successful!</p>
                    <p className="text-[10px] opacity-95 font-sans tracking-wide uppercase mt-1">Changes are now propagated across global Firestore nodes.</p>
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-sm font-serif italic text-center border-dashed">
                    <p className="font-semibold">✗ Save failed:</p>
                    <p className="text-xs font-mono mt-1">{saveErrorMessage}</p>
                  </div>
                )}

                {/* Language Segment Buttons */}
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] tracking-[0.2em] font-sans font-semibold text-earth-accent uppercase">
                    Edit Copy Language:
                  </span>
                  <div className="flex bg-stone-100 p-1 rounded-xl border border-earth-dark/5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setCmsLang('ENG')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-sans tracking-wider font-bold transition-all cursor-pointer ${
                        cmsLang === 'ENG'
                          ? 'bg-earth-dark text-raw-earth shadow-sm'
                          : 'text-[#6E6A5F] hover:text-[#3C3A35]'
                      }`}
                    >
                      ENGLISH (ENG)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCmsLang('VIE')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-sans tracking-wider font-bold transition-all cursor-pointer ${
                        cmsLang === 'VIE'
                          ? 'bg-earth-dark text-raw-earth shadow-sm'
                          : 'text-[#6E6A5F] hover:text-[#3C3A35]'
                      }`}
                    >
                      TIẾNG VIỆT (VIE)
                    </button>
                  </div>
                </div>

                {/* Website parts segment */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cms-section-select-dropdown" className="text-[10px] tracking-[0.2em] font-sans font-semibold text-earth-accent uppercase">
                    Select Page Section:
                  </label>
                  <select
                    id="cms-section-select-dropdown"
                    value={cmsSection}
                    onChange={(e: any) => setCmsSection(e.target.value)}
                    className="w-full py-3 px-4 bg-white border border-earth-dark/15 focus:outline-none focus:border-olive-drab rounded-xl font-serif text-sm italic cursor-pointer text-earth-dark shadow-sm bg-no-repeat"
                  >
                    <option value="hero">Part I // Hero Header &amp; Couple Naming</option>
                    <option value="details">Part II // Grounds Location &amp; Venue Schedules</option>
                    <option value="map">Part III // Location/Venue &amp; Watercolor Sketch Map Config</option>
                    <option value="story">Part IV // Path Taken (Historical Milestones)</option>
                    <option value="dresscode">Part VIII // Suggested Dress Code &amp; Color Scheme Palette</option>
                    <option value="rsvp">Part V // Union registry RSVP Form Elements</option>
                    <option value="thankyou">Part VI // Attendance Confirmation Toast Screens</option>
                    <option value="utils">Part VII // Footer &amp; System Navigation Elements</option>
                  </select>
                </div>

                {/* Render corresponding form fields based on section selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border-t border-earth-dark/5 pt-4">
                  {cmsSection === 'hero' && (
                    <>
                      <div className="md:col-span-2">{renderTextInput("Wedding Couple Name", "weddingName")}</div>
                      <div className="md:col-span-2">{renderTextInput("Browser Title", "weddingTitle")}</div>
                      {renderTextInput("Gathering Header Tag (Intro)", "gatheringHeader")}
                      {renderTextInput("Gathering Sub (Intro Date Sub)", "gatheringSub")}
                      <div className="md:col-span-2">{renderTextAreaInput("Hero Vibe Message Description", "heroVibeText")}</div>
                      {renderTextInput("Wedding Full Date Code", "october")}
                      {renderTextInput("City / Location State", "portland")}
                      {renderTextInput("Venue Highlight Subtitle", "wildMeadow")}
                    </>
                  )}

                  {cmsSection === 'details' && (
                    <>
                      {renderTextInput("Details Roman Tag Highlight", "detailsSectionNum")}
                      {renderTextInput("Details Title Banner", "detailsTitle")}
                      <div className="md:col-span-2">{renderTextAreaInput("Details Paragraph Introduction", "detailsDesc")}</div>
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-2" />
                      {renderTextInput("Ceremony Part Card Title", "theCeremony")}
                      {renderTextInput("Ceremony Part Details Text", "theCeremonyDesc")}
                      {renderTextInput("Rehearsal Party Banquet Card Title", "theGathering")}
                      {renderTextInput("Rehearsal Banquet Details Info", "theGatheringDesc")}
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-2" />
                      <div className="md:col-span-2">{renderTextInput("Accommodation Guideline tip text link", "accommodationTip")}</div>
                    </>
                  )}

                  {cmsSection === 'map' && (
                    <>
                      <div className="md:col-span-2 font-sans text-[10px] tracking-[0.2em] font-semibold text-earth-accent uppercase border-b border-earth-dark/5 pb-2 mb-2">
                        I. Location &amp; Directions Configuration
                      </div>
                      <div className="md:col-span-2">{renderTextInput("Venue Location Coordinates Text", "mapCoordinates")}</div>
                      <div className="md:col-span-2">{renderTextInput("Google Maps External Redirect URL", "mapGetDirectionsUrl")}</div>
                      <div className="md:col-span-2">{renderTextInput("Directions Navigation Link Key Title", "mapGetDirections")}</div>
                      
                      <div className="md:col-span-2 font-sans text-[10px] tracking-[0.2em] font-semibold text-earth-accent uppercase border-b border-earth-dark/5 pb-2 mt-4 mb-2">
                        II. Vector Labeling &amp; Map Illustration Marks
                      </div>
                      <div className="md:col-span-2">{renderTextInput("Map Interaction Overlay Banner", "interactiveMapBadge")}</div>
                      {renderTextInput("Map River Fork Label", "mapSiletzRiver")}
                      {renderTextInput("Map Pathway Pass Label", "mapForestPass")}
                      
                      <div className="md:col-span-2 font-sans text-[9px] tracking-[0.15em] font-semibold text-earth-dark/60 uppercase mt-2">
                        III. Floating Callout Point I (Ceremony Pin)
                      </div>
                      {renderTextInput("Landmark 1 Label (Title)", "mapWestRidgeLabel")}
                      {renderTextInput("Landmark 1 Subtext/Timestamp", "mapWestRidgeSub")}
                      
                      <div className="md:col-span-2 font-sans text-[9px] tracking-[0.15em] font-semibold text-earth-dark/60 uppercase mt-2">
                        IV. Floating Callout Point II (Gathering Pin)
                      </div>
                      {renderTextInput("Landmark 2 Label (Title)", "mapGlassBarnLabel")}
                      {renderTextInput("Landmark 2 Subtext/Timestamp", "mapGlassBarnSub")}
                    </>
                  )}

                  {cmsSection === 'story' && (
                    <>
                      {renderTextInput("Timeline Section Roman Flag", "storySectionNum")}
                      <div className="md:col-span-2">{renderTextInput("Story Narrative Core Title", "storyTitle")}</div>
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-2" />
                      {renderTextInput("Milestone 2021: Header Title", "story2021Title")}
                      <div className="md:col-span-2">{renderTextAreaInput("Milestone 2021: Description Narrative", "story2021Desc")}</div>
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-2" />
                      {renderTextInput("Milestone 2024: Header Title", "story2024Title")}
                      <div className="md:col-span-2">{renderTextAreaInput("Milestone 2024: Description Narrative", "story2024Desc")}</div>
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-2" />
                      {renderTextInput("Milestone 2026: Header Title", "story2026Title")}
                      <div className="md:col-span-2">{renderTextAreaInput("Milestone 2026: Description Narrative", "story2026Desc")}</div>
                    </>
                  )}

                  {cmsSection === 'rsvp' && (
                    <>
                      {renderTextInput("Registry Section Roman Flag", "rsvpSectionNum")}
                      {renderTextInput("RSVP Form Header Title", "rsvpTitle")}
                      <div className="md:col-span-2">{renderTextInput("RSVP Reply cutoff date", "rsvpReplyBy")}</div>
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-1" />
                      {renderTextInput("State I - Guest Name Title", "rsvpMyNameIs")}
                      {renderTextInput("State I - Enter name suggestion placeholder", "rsvpEnterNamePlaceholder")}
                      {renderTextInput("State II - Attendance Label status indicator", "rsvpUnderPines")}
                      {renderTextInput("State II - Yes option prompt", "rsvpWillBeThere")}
                      {renderTextInput("State II - No option prompt", "rsvpRegretfullyDecline")}
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-1" />
                      <div className="md:col-span-2">{renderTextInput("State III - Custom meal selection container label", "rsvpMealSelectionLabel")}</div>
                      {renderTextInput("Meal Option 1: Siletz Trout title", "rsvpMealTrout")}
                      {renderTextInput("Meal Option 2: Pine Alder Heifer title", "rsvpMealBeef")}
                      {renderTextInput("Meal Option 3: Ash Barley baked title (V)", "rsvpMealBarley")}
                      {renderTextInput("Meal Option 4: Harvest Pumpkin title (VG)", "rsvpMealGreens")}
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-1" />
                      {renderTextInput("State IV - Dietary restriction label", "rsvpDietaryLabel")}
                      {renderTextInput("State IV - Dietary placeholder tips", "rsvpDietaryPlaceholder")}
                      {renderTextInput("State V - Song prompt label", "rsvpSongLabel")}
                      {renderTextInput("State V - Song suggestion placeholder", "rsvpSongPlaceholder")}
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-4 my-1" />
                      {renderTextInput("State VI - Blessing greeting box label", "rsvpGreetingLabel")}
                      <div className="md:col-span-2">{renderTextInput("State VI - Blessing text area placeholder", "rsvpGreetingPlaceholder")}</div>
                      {renderTextInput("Commit Action Button - Sending label loader", "rsvpTransmitting")}
                      {renderTextInput("Commit Action Button - Standard execute label", "rsvpCommitEntry")}
                    </>
                  )}

                  {cmsSection === 'thankyou' && (
                    <>
                      <div className="md:col-span-2">{renderTextInput("Logged Success dialog floating bubble notification", "thankYouEntryLogged")}</div>
                      {renderTextInput("Success Screen main header text", "thankYouTitle")}
                      <div className="md:col-span-2">{renderTextAreaInput("Success Screen thank you paragraphs", "thankYouDesc")}</div>
                      {renderTextInput("Success Meal description title item", "thankYouMealPlatter")}
                      {renderTextInput("Success Back Button - Sửa đổi thông tin button", "thankYouEditBtn")}
                      {renderTextInput("Success Back Button - Maps revisit directions link text", "thankYouRevisitDirections")}
                    </>
                  )}

                  {cmsSection === 'utils' && (
                    <>
                      {renderTextInput("Main Navigation bar: Sound active trigger text", "navSoundOn")}
                      {renderTextInput("Main Navigation bar: Sound play suggestion text", "navSoundOff")}
                      {renderTextInput("Sidebar indexes: I. The Date selection labels", "romanNavDate")}
                      {renderTextInput("Sidebar indexes: II. Details selection labels", "romanNavDetails")}
                      {renderTextInput("Sidebar indexes: III. Our story selection labels", "romanNavStory")}
                      {renderTextInput("Sidebar indexes: IV. RSVP registry selection labels", "romanNavRsvp")}
                      {renderTextInput("Stickies CTA: Floating banner RSVP button text", "stickyRsvpBtn")}
                      {renderTextInput("Footer general copyrights notes description", "footerUnionText")}
                      {renderTextInput("Footer guest registry link tag text outline", "footerRegistryLedger")}
                    </>
                  )}

                  {cmsSection === 'dresscode' && (
                    <>
                      {renderTextInput("Navigation Menu Text", "romanNavDressCode")}
                      {renderTextInput("Dress Code Chapter Flag (e.g. 04 // Suggested Dress Code)", "dressCodeSectionNum")}
                      {renderTextInput("Dress Code Title", "dressCodeTitle")}
                      {renderTextInput("Attire Style Label", "dressCodeStyleLabel")}
                      {renderTextInput("Attire Style Short Description", "dressCodeStyleDesc")}
                      {renderTextInput("Guidelines Header Label", "dressCodeGuidelinesLabel")}
                      <div className="md:col-span-2">{renderTextAreaInput("Detailed Guidelines Explanation Description", "dressCodeGuidelinesDesc")}</div>
                      {renderTextInput("Suggested Wedding Palette Label", "dressCodeColorsLabel")}

                      {/* Color Palette customization sub-section */}
                      <div className="md:col-span-2 border-t border-earth-dark/5 pt-6 mt-4">
                        <span className="font-sans text-[10px] tracking-[0.2em] font-semibold text-earth-accent uppercase block mb-1">
                          III. Interactive Wedding Color Swatches
                        </span>
                        <p className="font-serif text-[11px] text-[#6E6A5F] italic mb-4">
                          Change color hex values or click on swatches to select standard colors for the live color palette.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                          {cmsPaletteColors.map((hex, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-earth-dark/10 shadow-xs flex flex-col gap-2">
                              {/* Swatch colorpicker label */}
                              <span className="font-sans text-[9px] text-[#8B8373] tracking-wider uppercase font-semibold">
                                Color {idx + 1}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {/* Color pick input element */}
                                <input
                                  type="color"
                                  value={hex}
                                  onChange={(e) => {
                                    const nextColors = [...cmsPaletteColors];
                                    nextColors[idx] = e.target.value.toUpperCase();
                                    setCmsPaletteColors(nextColors);
                                  }}
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-black/5 cursor-pointer shrink-0"
                                />
                                
                                <input
                                  type="text"
                                  value={hex}
                                  maxLength={7}
                                  onChange={(e) => {
                                    const nextColors = [...cmsPaletteColors];
                                    nextColors[idx] = e.target.value.toUpperCase();
                                    setCmsPaletteColors(nextColors);
                                  }}
                                  className="w-full text-xs font-mono py-1 px-1.5 border border-earth-dark/15 rounded-md text-earth-dark uppercase text-center"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-earth-dark/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <span className="text-[10px] text-neutral-400 italic font-serif">
                    Pushing changes merges translation dictionaries across database shards instantly.
                  </span>

                  <button
                    type="submit"
                    disabled={isSavingContent}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-olive-drab hover:bg-[#4E4B42] text-white tracking-widest font-sans text-xs font-bold transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    <span>✓ SAVE &amp; BUILD SITE</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {adminTab === 'images' && (
          <div className="flex flex-col gap-6 mt-4">
            <div className="bg-[#FAF8F5]/80 backdrop-blur-xs border border-earth-dark/5 rounded-2xl p-6 sm:p-8 shadow-xs text-left">
              <div className="border-b border-earth-dark/5 pb-4 mb-6">
                <h2 className="font-serif text-2xl font-light text-earth-dark flex items-center gap-2 select-text">
                  <span>🖼️ Global Image Assets Registry</span>
                </h2>
                <p className="font-sans text-xs text-[#6E6A5F] mt-1.5 select-text leading-relaxed">
                  All image assets on your wedding website are managed statically for maximum performance, caching, and loading speed. Simply enter the static relative path (e.g. <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">/images/hero.jpg</code>), a web URL, or use Cloudinary to upload the assets live!
                </p>
              </div>

              {/* Cloudinary live integration settings box */}
              <div className="bg-[#8A9A86]/5 border border-olive-drab/10 rounded-2xl p-5 mb-6 text-stone-700">
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-earth-accent mb-2.5 flex items-center gap-1.5">
                  <span>☁️ Cloudinary Live Integration Settings</span>
                </h3>
                <p className="text-[11.5px] text-[#6E6A5F] leading-relaxed mb-4">
                  For your wedding and guest family uploads to save directly in the cloud, configure your <strong>Unsigned Upload Preset</strong>. Changes are saved to secure Firestore shards.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Cloudinary Cloud Name</label>
                    <input
                      type="text"
                      className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 font-sans text-xs text-earth-dark focus:border-olive-drab focus:outline-none placeholder:text-stone-300"
                      value={cloudinaryCloudName}
                      onChange={(e) => setCloudinaryCloudName(e.target.value)}
                      placeholder="e.g. dcgtz1nwr"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Unsigned Upload Preset</label>
                    <input
                      type="text"
                      className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 font-sans text-xs text-earth-dark focus:border-olive-drab focus:outline-none placeholder:text-stone-300"
                      value={cloudinaryUploadPreset}
                      onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                      placeholder="e.g. wedding_unsigned_preset"
                    />
                  </div>
                </div>
              </div>

              {/* Status Alert if some paths are empty */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-[11.5px] text-amber-800 flex items-start gap-2 select-text mb-6">
                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-sans leading-relaxed">
                  <strong>💡 How this works:</strong> Clear any input to immediately revert that slot back to its beautifully curated local fallback asset. Clicking <strong>SAVE IMAGE REGISTRY</strong> at the bottom will apply your paths instantly across the live landing page.
                </p>
              </div>

              <form onSubmit={handleSaveCmsContent} className="space-y-6">
                <ImageAssetField
                  title="Hero Banner Background Image"
                  description="The major fullscreen welcome photo supporting text overlay at the bottom of the fold."
                  currentValue={cmsImageUrl}
                  fallbackValue={defaultHeroImage}
                  onChange={setCmsImageUrl}
                  recommendedPaths={['/images/hero.jpg', '/images/hero_backup.jpg']}
                  onUploadClick={() => openCloudinaryUploader('hero')}
                  uploadState={uploadStates['hero']}
                />

                <ImageAssetField
                  title="The Date Section - Left Floating Portrait"
                  description="Partner portrait photo aligned along the left margin of the central wedding timeline."
                  currentValue={cmsLeftPortraitUrl}
                  fallbackValue="https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600"
                  onChange={setCmsLeftPortraitUrl}
                  recommendedPaths={['/images/left_portrait.jpg']}
                  onUploadClick={() => openCloudinaryUploader('left')}
                  uploadState={uploadStates['left']}
                />

                <ImageAssetField
                  title="The Date Section - Right Floating Portrait"
                  description="Partner portrait photo flanking the right margin of the central wedding timeline."
                  currentValue={cmsRightPortraitUrl}
                  fallbackValue="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600"
                  onChange={setCmsRightPortraitUrl}
                  recommendedPaths={['/images/right_portrait.jpg']}
                  onUploadClick={() => openCloudinaryUploader('right')}
                  uploadState={uploadStates['right']}
                />

                <ImageAssetField
                  title="Dress Code Style Graphic"
                  description="Style guide mood board rendered graceside the color palette swatches."
                  currentValue={cmsDressCodeImageUrl}
                  fallbackValue="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600"
                  onChange={setCmsDressCodeImageUrl}
                  recommendedPaths={['/images/dress_code.jpg']}
                  onUploadClick={() => openCloudinaryUploader('dress')}
                  uploadState={uploadStates['dress']}
                />

                <ImageAssetField
                  title="Venue Map Sketch Graphic"
                  description="Standard hand-drawn picture. Clear this input to resort to the beautiful, interactive dynamic SVG map."
                  currentValue={cmsMapImageUrl}
                  fallbackValue=""
                  onChange={setCmsMapImageUrl}
                  recommendedPaths={['/images/venue_map.jpg']}
                  onUploadClick={() => openCloudinaryUploader('map')}
                  uploadState={uploadStates['map']}
                />

                {/* Form Action Panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-earth-dark/5 mt-8 select-text">
                  <div>
                    {saveStatus === 'saved' && (
                      <p className="font-sans text-xs text-olive-drab flex items-center gap-1">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Registry paths updated and deployed successfully!</span>
                      </p>
                    )}
                    {saveStatus === 'saving' && (
                      <p className="font-sans text-xs text-stone-500 animate-pulse flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Firestore registry document...</span>
                      </p>
                    )}
                    {saveStatus === 'error' && (
                      <p className="font-sans text-xs text-red-600 font-semibold select-text">
                        ❌ Save failed: {saveErrorMessage}
                      </p>
                    )}
                    {saveStatus === 'idle' && (
                      <p className="font-sans text-[11px] text-[#A39E93]">
                        Pending configuration modifications will apply live to all guest sessions upon save.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingContent}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-olive-drab hover:bg-[#4E4B42] text-white tracking-widest font-sans text-xs font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 w-full sm:w-auto justify-center"
                  >
                    <span>✓ SAVE IMAGE REGISTRY</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
    );
  }

  return (
    <div id="invitation-container" className="paper-texture relative min-h-screen bg-raw-earth text-earth-dark select-none antialiased selection:bg-olive-light selection:text-raw-earth">
      
      {/* Decorative Floating Botanical Sketches (Asymmetrical Parallax Placement) */}
      <div className="fixed top-0 left-0 z-0 pointer-events-none sticky-fleur">
        <motion.div
          animate={{
            y: [12, -12, 12],
            rotate: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="origin-top-left translate-x-[-15%] translate-y-[-10%]"
        >
          <EucalyptusLeft />
        </motion.div>
      </div>

      <div className="fixed bottom-0 right-0 z-0 pointer-events-none sticky-fleur">
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="origin-bottom-right translate-x-[15%] translate-y-[10%]"
        >
          <OliveBranchRight />
        </motion.div>
      </div>

      {/* Floating Ambient music player in Eothen Organic Spirit */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Language selector button */}
        <button
          onClick={toggleLanguage}
          type="button"
          id="language-toggle"
          aria-label="Switch language / Đổi ngôn ngữ"
          className="px-4 py-3 text-[11px] font-sans font-bold hover:bg-earth-dark hover:text-raw-earth hover:border-transparent transition-all duration-300 rounded-full border border-earth-accent/20 bg-raw-earth/75 backdrop-blur-md shadow-sm cursor-pointer flex items-center gap-1 uppercase"
        >
          <span className={lang === 'ENG' ? 'text-earth-dark font-black' : 'text-earth-dark/40 font-medium'}>ENG</span>
          <span className="text-earth-dark/20 font-light mx-0.5">|</span>
          <span className={lang === 'VIE' ? 'text-earth-dark font-black' : 'text-earth-dark/40 font-medium'}>VIE</span>
        </button>

        <button
          onClick={toggleAudio}
          type="button"
          id="sound-toggle"
          aria-label="Toggle atmospheric sound loop"
          className="p-3.5 rounded-full border border-earth-accent/20 bg-raw-earth/75 backdrop-blur-md hover:bg-earth-dark hover:text-raw-earth hover:border-transparent transition-all duration-300 shadow-sm cursor-pointer"
        >
          {isPlayingAudio ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-sans uppercase">{t.navSoundOn}</span>
              <Volume2 size={13} className="animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest opacity-60 font-sans uppercase">{t.navSoundOff}</span>
              <VolumeX size={13} className="opacity-60" />
            </div>
          )}
        </button>
      </div>

      {/* EOTHEM Sidebar / Roman Floating Nav Control Block */}
      <nav id="eothen-sidebar" className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8 text-[11px] tracking-[0.3em] font-sans">
        <div className="w-[1px] h-24 bg-earth-dark/10 mb-2 self-center"></div>
        
        <a 
          href="#hero" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'hero' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">I.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.romanNavDate}</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'hero' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#details" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'details' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">II.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.romanNavDetails}</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'details' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#story" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'story' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">III.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.romanNavStory}</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'story' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#dress-code" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'dress-code' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">IV.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.romanNavDressCode}</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'dress-code' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#rsvp" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'rsvp' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">V.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{t.romanNavRsvp}</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'rsvp' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <div className="w-[1px] h-24 bg-earth-dark/10 mt-2 self-center"></div>
      </nav>

      {/* Floating Sticky RSVP Follower on Mobile and Tablet (Unobtrusive Thin Banner) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <a 
          href="#rsvp" 
          id="sticky-rsvp-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-earth-dark text-raw-earth text-xs tracking-[0.2em] font-sans hover:bg-earth-dark/90 transition-all duration-300 active:scale-95 shadow-lg border border-earth-dark/5"
        >
          <span>{t.stickyRsvpBtn}</span>
          <ArrowRight size={12} className="opacity-80" />
        </a>
      </div>

      {/* SECTION 1: THE CLEAN HERO BANNER */}
      <section 
        id="hero" 
        className="h-screen w-full relative bg-cover bg-center bg-no-repeat flex flex-col justify-end items-center pb-6 select-none overflow-hidden"
        style={{ 
          backgroundImage: `url(${heroImageUrl})`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Smooth dark dim overlay tint */}
        <div className="absolute inset-0 bg-black/15" />

        {/* Centered names typography at bottom edge of screen fold */}
        <div 
          className="relative z-10 text-center px-4 max-w-4xl select-text animate-[fadeIn_1.5s_ease-out_forwards]"
          style={{ opacity: heroOpacity }}
        >
          <h1 className="text-[100px] md:text-[180px] font-luxurious leading-[80px] md:leading-[120px] text-[#FFE4E9] drop-shadow-md select-text">
            {t.weddingName.includes('&') ? (
              <>
                <span className="block">{t.weddingName.split('&')[0].trim()}</span>
                <span className="block">&amp; {t.weddingName.split('&')[1].trim()}</span>
              </>
            ) : (
              t.weddingName
            )}
          </h1>
        </div>
      </section>

      {/* SECTION 2: THE COMPACT "THE DATE" AREA WITH POLAROID COLLAGE & PARALLAX SCROLL */}
      <section 
        id="the-date" 
        className="relative w-full py-16 md:py-32 px-4 md:px-12 bg-[#F4F1EE] text-earth-dark/90 flex flex-col items-center justify-start scroll-mt-12 min-h-[155vh] md:min-h-[205vh] overflow-hidden"
      >
        {/* Central Block: Meticulously designed editorial typography, dates, and countdown */}
        <div className="z-0 md:absolute md:top-[42%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-center flex flex-col items-center max-w-xl w-full select-all px-4">
          {/* Symmetrical Dual-Bride/Groom Name Layout in Luxurious Script */}
            <div className="flex flex-col items-center text-[#2A2A2A] font-serif">
              <div className="flex items-center gap-6 sm:gap-14">
                {/* Left side couple representation */}
                <div className="text-right">
                  <div 
                    className="text-4xl sm:text-5xl lg:text-[54px] text-[#2A2A2A] leading-none tracking-tight font-medium" 
                    style={{ fontFamily: '"Luxurious Script", cursive' }}
                  >
                    {t.weddingName.includes('&') ? t.weddingName.split('&')[0].trim() : 'Gia Bảo'}
                  </div>
                  <div 
                    className="text-2xl sm:text-3xl lg:text-[38px] text-earth-accent italic font-light leading-none mt-1"
                    style={{ fontFamily: '"Luxurious Script", cursive' }}
                  >
                    {t.weddingName.includes('&') ? `& ${t.weddingName.split('&')[1].trim()}` : '& John'}
                  </div>
                </div>

                {/* Ornate ampersand separator */}
                <div className="text-xl sm:text-2xl font-serif italic text-earth-accent/40 select-none">
                  &amp;
                </div>

                {/* Right side couple representation (mirrored composition) */}
                <div className="text-left">
                  <div 
                    className="text-4xl sm:text-5xl lg:text-[54px] text-[#2A2A2A] leading-none tracking-tight font-medium" 
                    style={{ fontFamily: '"Luxurious Script", cursive' }}
                  >
                    {t.weddingName.includes('&') ? t.weddingName.split('&')[0].trim() : 'Gia Bảo'}
                  </div>
                  <div 
                    className="text-2xl sm:text-3xl lg:text-[38px] text-earth-accent italic font-light leading-none mt-1"
                    style={{ fontFamily: '"Luxurious Script", cursive' }}
                  >
                    {t.weddingName.includes('&') ? `& ${t.weddingName.split('&')[1].trim()}` : '& John'}
                  </div>
                </div>
              </div>

              {/* Slogan banner */}
              <div 
                className="mt-5 text-3xl sm:text-4xl lg:text-[44px] text-earth-accent tracking-wide italic select-text"
                style={{ fontFamily: '"Luxurious Script", cursive' }}
              >
                {lang === 'ENG' ? 'are getting married' : 'sắp sửa về chung một nhà'}
              </div>
            </div>

            {/* Symmetrical Dividers enclosing the Wedding Narrative */}
            <div className="w-full h-[0.7px] bg-[#2A2A2A]/15 my-5 max-w-sm"></div>
            <p className="max-w-md font-serif text-[13px] sm:text-[14px] leading-relaxed text-earth-dark/90 italic font-light text-center px-4 select-text">
              {t.heroVibeText}
            </p>
            <div className="w-full h-[0.7px] bg-[#2A2A2A]/15 my-5 max-w-sm"></div>

            {/* Flanked date, location columns exactly mimicking the lookbook */}
            <div className="w-full max-w-md grid grid-cols-3 gap-2 items-center justify-center text-center font-serif text-[10px] sm:text-[11px] tracking-[0.2em] text-[#2A2A2A] pt-1 uppercase">
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold tracking-normal text-[#2A2A2A]">10</span>
                <span className="text-[8px] sm:text-[9px] tracking-widest text-[#8F887C] font-semibold mt-1">
                  {lang === 'ENG' ? 'OCT, 2026' : 'T10, 2026'}
                </span>
              </div>
              
              <div className="flex flex-col items-center border-x border-[#2A2A2A]/10 px-1 sm:px-2">
                <span className="font-bold tracking-widest text-[#2A2A2A] text-[9px] sm:text-[10px]">
                  {t.portland.includes(',') ? t.portland.split(',')[0].trim().toUpperCase() : 'PORTLAND'}
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-widest text-[#8F887C] font-semibold mt-0.5">
                  {t.portland.includes(',') ? t.portland.split(',')[1].trim().toUpperCase() : 'OREGON'}
                </span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold tracking-normal text-[#2A2A2A]">10</span>
                <span className="text-[8px] sm:text-[9px] tracking-widest text-[#8F887C] font-semibold mt-1">
                  {lang === 'ENG' ? 'OCT, 2026' : 'T10, 2026'}
                </span>
              </div>
            </div>

            {/* Inobtrusive Minimal Ring Countdown Indicator */}
            <div className="mt-8 px-5 py-2 bg-white/20 border border-black/[0.03] rounded-full flex gap-4 items-center justify-center font-sans text-[10px] tracking-widest text-[#5C564D] shadow-xs select-none">
              <div className="flex gap-1 items-baseline">
                <span className="font-serif text-xs sm:text-sm text-[#2A2A2A] font-medium">{countdown.days}</span>
                <span className="text-[7.5px] text-[#A39A8E] uppercase font-bold">{lang === 'ENG' ? 'D' : 'N'}</span>
              </div>
              <div className="text-earth-dark/20 text-xs">•</div>
              <div className="flex gap-1 items-baseline">
                <span className="font-serif text-xs sm:text-sm text-[#2A2A2A] font-medium">{countdown.hours}</span>
                <span className="text-[7.5px] text-[#A39A8E] uppercase font-bold">H</span>
              </div>
              <div className="text-earth-dark/20 text-xs">•</div>
              <div className="flex gap-1 items-baseline">
                <span className="font-serif text-xs sm:text-sm text-[#2A2A2A] font-medium">{countdown.minutes}</span>
                <span className="text-[7.5px] text-[#A39A8E] uppercase font-bold">M</span>
              </div>
              <div className="text-earth-dark/20 text-xs">•</div>
              <div className="flex gap-1 items-baseline">
                <span className="font-serif text-xs sm:text-sm text-[#2A2A2A] font-medium">{countdown.seconds}</span>
                <span className="text-[7.5px] text-[#A39A8E] uppercase font-bold">S</span>
              </div>
            </div>
          </div>

          {/* DESKTOP COLLAGE VIEW: High-end Absolute + Parallax Scrolling Positions */}
          <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none select-none z-1">
            
            {/* Polaroid 1 (Top-Right): Dreamy pathway view */}
            <ParallaxItem speed={-0.06} className="absolute top-[4%] right-[6%] w-[270px] lg:w-[320px] pointer-events-auto z-5">
              <Polaroid 
                src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600" 
                alt="Enchanting wedding pathway forest" 
                landscape 
              />
            </ParallaxItem>

            {/* Polaroid 2 (Middle-Left): Overlooking Water with top-right double-swan seal */}
            <ParallaxItem speed={0.05} className="absolute top-[20%] left-[5%] w-[230px] lg:w-[275px] pointer-events-auto z-15">
              <div className="relative">
                <Polaroid 
                  src={leftPortraitUrl} 
                  alt="Wedding Couple overlooking waterside" 
                />
                <SwanSeal className="absolute -top-7 -right-7 z-25 drop-shadow-[2px_4px_12px_rgba(0,0,0,0.08)]" />
              </div>
            </ParallaxItem>

            {/* Polaroid 3 (Middle-Right): B&W couple dance celebrating */}
            <ParallaxItem speed={-0.03} className="absolute top-[42%] right-[5%] w-[260px] lg:w-[310px] pointer-events-auto z-5">
              <Polaroid 
                src={rightPortraitUrl} 
                alt="Aesthetic couple romantic dance" 
                landscape 
              />
            </ParallaxItem>

            {/* Polaroid 4 (Bottom-Middle): Quiet path across tall pines */}
            <ParallaxItem speed={0.02} className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[280px] lg:w-[340px] pointer-events-auto z-5">
              <Polaroid 
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600" 
                alt="Forest pathways of mountain gorge" 
                landscape 
              />
            </ParallaxItem>

            {/* Polaroid 5 (Bottom-Right): Gracious bride holding bouquet with top-left double-swan seal */}
            <ParallaxItem speed={-0.04} className="absolute top-[78%] right-[8%] w-[220px] lg:w-[265px] pointer-events-auto z-15">
              <div className="relative">
                <Polaroid 
                  src={dressCodeImageUrl} 
                  alt="Bride holding delicate flowers" 
                />
                <SwanSeal className="absolute -top-7 -left-7 z-25 drop-shadow-[-2px_4px_12px_rgba(0,0,0,0.08)]" />
              </div>
            </ParallaxItem>

          </div>

          {/* MOBILE & TABLET STAGGERED FLOW: Pure-performance vertical masonry list */}
          <div className="md:hidden flex flex-col gap-6 w-full max-w-sm mt-8 relative z-5">
            {/* Polaroid 1 (Top-Right substitute) */}
            <div className="w-full transform -rotate-1 shadow-md">
              <Polaroid 
                src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600" 
                alt="Scenic cottage woods" 
                landscape 
              />
            </div>

            {/* Polaroid 2 (Middle-Left substitute) with swan seal */}
            <div className="w-[90%] self-start transform rotate-2 relative shadow-md">
              <Polaroid 
                src={leftPortraitUrl} 
                alt="Couple overlooking shore" 
              />
              <SwanSeal className="absolute -top-5 -right-5 z-20 scale-85" />
            </div>

            {/* Polaroid 3 (Middle-Right substitute) */}
            <div className="w-[95%] self-end transform -rotate-2 shadow-md">
              <Polaroid 
                src={rightPortraitUrl} 
                alt="Couple dancing B&W" 
                landscape 
              />
            </div>

            {/* Polaroid 4 (Bottom-Middle substitute) */}
            <div className="w-full transform rotate-1 shadow-md">
              <Polaroid 
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600" 
                alt="Scenic cottage woods path" 
                landscape 
              />
            </div>

            {/* Polaroid 5 (Bottom-Right substitute) with swan seal */}
            <div className="w-[88%] self-end transform -rotate-1 relative shadow-md">
              <Polaroid 
                src={dressCodeImageUrl} 
                alt="Beautiful bride looking skyward" 
              />
              <SwanSeal className="absolute -top-5 -left-5 z-20 scale-85" />
            </div>
          </div>
        </section>

        {/* Main Content Lookbook wrapper - meticulously padded */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:pl-32 lg:pr-12 py-12">

        {/* SEC II: EVENT DETAILS & MAP */}
        <section 
          id="details" 
          className="min-h-screen py-24 border-t border-earth-dark/5 scroll-mt-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Header Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="font-serif text-sm italic text-olive-light font-light leading-none">
                {t.detailsSectionNum}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight leading-none">
                {t.detailsTitle}
              </h2>
              <p className="font-serif text-neutral-600 font-light leading-relaxed text-base select-text">
                {t.detailsDesc}
              </p>

              {/* Ceremony Detail Block */}
              <div className="mt-8 border-l-2 border-olive-drab/25 pl-6 py-2 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-olive-drab" />
                  <span className="text-xs tracking-[0.18em] font-sans font-semibold uppercase text-earth-dark">{t.theCeremony}</span>
                </div>
                <p className="font-serif italic text-sm text-earth-accent">
                  {t.theCeremonyDesc}
                </p>
              </div>

              {/* Reception Detail Block */}
              <div className="border-l-2 border-olive-drab/25 pl-6 py-2 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Utensils size={15} className="text-olive-drab" />
                  <span className="text-xs tracking-[0.18em] font-sans font-semibold uppercase text-earth-dark">{t.theGathering}</span>
                </div>
                <p className="font-serif italic text-sm text-earth-accent">
                  {t.theGatheringDesc}
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-olive-drab/80 mt-2 font-mono bg-olive-light/5 p-3 rounded border border-olive-light/10">
                <Info size={14} className="shrink-0" />
                <span>{t.accommodationTip}</span>
              </div>
            </div>

            {/* Stylized Map View SVG Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div id="vector-map-frame" className="relative rounded-2xl border border-earth-dark/15 p-4 md:p-6 bg-[#F3F2EE] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full border border-earth-dark/10 bg-[#FAF8F5]/90 backdrop-blur-xs text-[9px] tracking-widest font-sans uppercase">
                  <Compass size={11} className="text-earth-dark/60 animate-[spin_20s_linear_infinite]" />
                  <span>{t.interactiveMapBadge}</span>
                </div>

                {/* Elegant Hand-Drawn Minimalist Procedural Vector Map or Image Override */}
                {mapImageUrl ? (
                  <div className="w-full aspect-[5/4] rounded-xl overflow-hidden bg-stone-100 hover:shadow-inner transition-shadow duration-300">
                    <img 
                      src={mapImageUrl} 
                      alt="Scenic hand-drawn grounds map" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <svg 
                    viewBox="0 0 500 400" 
                    className="w-full h-auto stroke-earth-dark fill-none stroke-[1.1] rounded-xl bg-[#F3F2EE]"
                    aria-label="Scenic hand-drawn grounds map"
                  >
                    {/* Fine vintage grid lines underneath */}
                    <g className="stroke-earth-dark/[0.04] stroke-[0.5]">
                      <line x1="100" y1="0" x2="100" y2="400" />
                      <line x1="200" y1="0" x2="200" y2="400" />
                      <line x1="300" y1="0" x2="300" y2="400" />
                      <line x1="400" y1="0" x2="400" y2="400" />
                      <line x1="0" y1="100" x2="500" y2="100" />
                      <line x1="0" y1="200" x2="500" y2="200" />
                      <line x1="0" y1="300" x2="500" y2="300" />
                    </g>

                    {/* Contour land wave lines */}
                    {contours.map((pathStr, index) => (
                      <path 
                        key={index} 
                        d={pathStr} 
                        className="stroke-earth-dark/10 stroke-[0.7] stroke-dasharray-[3,6]" 
                      />
                    ))}
                    
                    {/* Organic river fork flowing across */}
                    <path 
                      d={riverPath} 
                      className="stroke-[#9AA996]/55 stroke-[2] opacity-70" 
                    />
                    <g transform={`translate(${getSeededValue(mapSeed + 40, 230, 310)}, ${getSeededValue(mapSeed + 41, 100, 150)})`}>
                      <text 
                        x="0" 
                        y="0" 
                        transform={`rotate(${getSeededValue(mapSeed + 42, -10, 15)})`}
                        className="font-serif italic text-[9.5px] fill-[#8A9A86] font-light stroke-none tracking-wide select-none"
                      >
                        {t.mapSiletzRiver}
                      </text>
                    </g>

                    {/* Ground pathway - winding/meandering forest pass */}
                    <path 
                      d={roadPath} 
                      className="stroke-earth-dark/30 stroke-[1] stroke-dasharray-[4,4]" 
                    />
                    <g transform={`translate(${getSeededValue(mapSeed + 43, 70, 110)}, ${getSeededValue(mapSeed + 44, 280, 330)})`}>
                      <text 
                        x="0" 
                        y="0" 
                        transform={`rotate(${getSeededValue(mapSeed + 45, -65, -45)})`}
                        className="font-sans text-[7.5px] tracking-[0.2em] font-medium fill-earth-dark/60 uppercase stroke-none select-none"
                      >
                        {t.mapForestPass}
                      </text>
                    </g>

                    {/* Secondary light connection path between sites */}
                    <path 
                      d={path1} 
                      className="stroke-earth-dark/15 stroke-[0.8] stroke-dasharray-[2,3]" 
                    />

                    {/* Dynamic hand-drawn organic wireframe pine trees on map sides */}
                    {pines.map((p, idx) => (
                      <g key={idx} transform={`translate(${p.x}, ${p.y}) scale(${p.scale})`} className="stroke-earth-dark/40 stroke-[0.8]">
                        <path d="M 0,14 L 0,-6 M -4,2 L 0,-2 L 4,2" />
                        <path d="M -3,-1 L 0,-5 L 3,-1" />
                      </g>
                    ))}

                    {/* Compass star motif in top left */}
                    <g transform="translate(55, 65)">
                      <circle cx="0" cy="0" r="16" className="stroke-earth-dark/10 stroke-[0.8]" />
                      <path d="M 0,-20 L 0,20 M -20,0 L 20,0" className="stroke-earth-dark/20 stroke-[0.5]" />
                      <polygon points="0,-14 3.5,0 0,2 0,-14" className="fill-earth-dark stroke-none" />
                      <polygon points="0,14 -3.5,0 0,-2 0,14" className="fill-earth-accent/70 stroke-none" />
                      <text x="0" y="-23" textAnchor="middle" className="font-sans text-[8px] font-bold fill-earth-dark stroke-none tracking-widest">N</text>
                    </g>

                    {/* Landmark Pin 1 Callout Card */}
                    <g transform={`translate(${x1}, ${y1})`}>
                      <circle cx="0" cy="0" r="14" className="stroke-olive-drab/30 stroke-[0.8] fill-none animate-[ping_4.5s_infinite_ease-in-out]" />
                      <circle cx="0" cy="0" r="5" className="fill-olive-drab stroke-white stroke-[0.8]" />
                      
                      {/* Hover container box */}
                      <g transform="translate(14, -22)" className="cursor-default">
                        {/* White-cream callout frame with shadow */}
                        <rect x="0" y="0" width="160" height="42" rx="4" className="fill-[#FAF8F5]/98 stroke-earth-dark/12 stroke-[0.8] shadow-sm" />
                        {/* Color marker column bar */}
                        <rect x="0" y="0" width="3" height="42" rx="1" className="fill-olive-drab" />
                        
                        <text x="12" y="17" className="font-sans text-[10px] font-bold fill-earth-dark tracking-wider stroke-none">{t.mapWestRidgeLabel}</text>
                        <text x="12" y="31" className="font-serif italic text-[9px] fill-earth-accent stroke-none font-light">{t.mapWestRidgeSub}</text>
                      </g>
                    </g>

                    {/* Landmark Pin 2 Callout Card */}
                    <g transform={`translate(${x2}, ${y2})`}>
                      <circle cx="0" cy="0" r="14" className="stroke-earth-accent/30 stroke-[0.8] fill-none animate-[ping_6s_infinite_ease-in-out]" />
                      <circle cx="0" cy="0" r="5" className="fill-earth-accent stroke-white stroke-[0.8]" />
                      
                      {/* Hover container box */}
                      <g transform="translate(14, -22)" className="cursor-default">
                        {/* White-cream callout frame with shadow */}
                        <rect x="0" y="0" width="160" height="42" rx="4" className="fill-[#FAF8F5]/98 stroke-earth-dark/12 stroke-[0.8] shadow-sm" />
                        {/* Color marker column bar */}
                        <rect x="0" y="0" width="3" height="42" rx="1" className="fill-earth-accent" />
                        
                        <text x="12" y="17" className="font-sans text-[10px] font-[700] fill-earth-dark tracking-wider stroke-none">{t.mapGlassBarnLabel}</text>
                        <text x="12" y="31" className="font-serif italic text-[9px] fill-olive-drab stroke-none font-light">{t.mapGlassBarnSub}</text>
                      </g>
                    </g>
                  </svg>
                )}

                {/* Bottom Coordinates & Navigation Bar */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs text-earth-accent font-light">
                  <span className="flex items-center gap-2 select-text font-serif italic text-neutral-600">
                    <MapPin size={13} className="text-olive-drab shrink-0" />
                    <span>{t.mapCoordinates}</span>
                  </span>
                  
                  <a 
                    href={t.mapGetDirectionsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-earth-dark font-medium font-sans tracking-widest text-[10px] uppercase transition-colors"
                  >
                    <span>{t.mapGetDirections}</span>
                    <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SEC III: OUR STORY & DESIGN JOURNAL */}
        <section 
          id="story" 
          className="min-h-[80vh] py-24 border-t border-earth-dark/5 scroll-mt-12 relative"
        >
          {/* Accent Mini botanical element inside */}
          <div className="absolute top-10 right-4 lg:right-20 opacity-30">
            <MinimalRoseDetail />
          </div>

          <div className="max-w-3xl">
            <span className="font-serif text-sm italic text-olive-light font-light mb-6 block">
              {t.storySectionNum}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-12 leading-tight">
              {t.storyTitle}
            </h2>

            {/* Editorial asymmetric layout */}
            <div className="space-y-12 md:space-y-16">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2021
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">{t.story2021Title}</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    {t.story2021Desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2024
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">{t.story2024Title}</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    {t.story2024Desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2026
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">{t.story2026Title}</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    {t.story2026Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SEC III.V: DRESS CODE & PALETTE */}
        <section 
          id="dress-code" 
          className="py-24 border-t border-earth-dark/5 scroll-mt-12 relative text-left"
        >
          <div className="absolute top-10 right-4 lg:right-20 opacity-30 select-none pointer-events-none">
            <MinimalRoseDetail />
          </div>

          <div className="max-w-3xl">
            <span className="font-serif text-sm italic text-olive-light font-light mb-6 block">
              {t.dressCodeSectionNum}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-12 leading-tight">
              {t.dressCodeTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              {/* Left Details block: 7 cols */}
              <div className="md:col-span-7 flex flex-col gap-8">
                {/* Attire style */}
                <div>
                  <h4 className="font-sans text-[10px] tracking-[0.25em] font-semibold text-earth-accent uppercase mb-2">
                    {t.dressCodeStyleLabel}
                  </h4>
                  <p className="font-serif text-xl font-light text-[#5E5B52]">
                    {t.dressCodeStyleDesc}
                  </p>
                </div>

                {/* Guidelines description */}
                <div>
                  <h4 className="font-sans text-[10px] tracking-[0.25em] font-semibold text-earth-accent uppercase mb-2">
                    {t.dressCodeGuidelinesLabel}
                  </h4>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    {t.dressCodeGuidelinesDesc}
                  </p>
                </div>
              </div>

              {/* Right Palette circle list: 5 cols */}
              <div className="md:col-span-5 bg-[#FAF8F5]/80 border border-earth-dark/5 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] text-center">
                <h4 className="font-sans text-[10px] tracking-[0.25em] font-semibold text-[#8B8373] uppercase mb-6">
                  {t.dressCodeColorsLabel}
                </h4>
                
                {/* 5-circle swatch flex */}
                <div className="flex justify-center items-center gap-3.5 sm:gap-4 py-2 flex-wrap">
                  {paletteColors.map((hex, index) => (
                    <div key={index} className="flex flex-col items-center gap-1.5 min-w-[55px]">
                      <div 
                        className="w-11 h-11 rounded-full border border-black/5 shadow-inner transition-transform duration-300 hover:scale-110 relative group cursor-pointer"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        {/* Tooltip on hover showing hex code */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-earth-dark text-white rounded text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
                          {hex}
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-[#A29A88] select-all">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SEC IV: THE RSVP EXPERIENCE (Zen Journal Form) */}
        <section 
          id="rsvp" 
          className="min-h-screen py-24 border-t border-earth-dark/5 scroll-mt-12 relative flex flex-col justify-center"
        >
          {/* Dynamic Petals Renderer as a celebration canopy overlay */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden z-25">
            {petals.map(p => (
              <div
                key={p.id}
                className="absolute w-2 h-3 md:w-3.5 md:h-4 rounded-full bg-[#E5D7D5] border-l border-white/20 opacity-70 filter blur-[0.4px]"
                style={{
                  top: `${p.y}px`,
                  left: `${p.x}px`,
                  transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>

          <div className="max-w-2xl mx-auto w-full relative z-30">
            
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="rsvp-form-container"
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="rounded-3xl border border-earth-dark/10 p-6 md:p-10 lg:p-12 bg-raw-earth/95 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <MinimalRoseDetail />
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-[10px] tracking-[0.35em] font-sans text-earth-accent uppercase leading-none block mb-3">
                      {t.rsvpSectionNum}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-light mb-3 italic">
                      {t.rsvpTitle}
                    </h2>
                    <p className="font-sans text-[11px] tracking-widest text-[#6E6A5F] uppercase">
                      {t.rsvpReplyBy}
                    </p>
                  </div>

                  {/* Aesthetic Physical Journal Style Form */}
                  <form onSubmit={handleRsvpSubmit} className="space-y-8 font-serif leading-10 select-text">
                    
                    {/* Name block input */}
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap">
                      <label htmlFor="name-input" className="text-base text-earth-accent">
                        {t.rsvpMyNameIs}
                      </label>
                      <input 
                        id="name-input"
                        type="text" 
                        required
                        placeholder={t.rsvpEnterNamePlaceholder}
                        value={rsvpState.name}
                        onChange={(e) => setRsvpState({ ...rsvpState, name: e.target.value })}
                        className="py-1 bg-transparent border-b border-earth-dark/20 text-lg text-earth-dark placeholder-neutral-400 focus:outline-none focus:border-olive-drab transition-colors flex-1 font-serif italic text-center md:text-left min-w-[200px]"
                      />
                    </div>

                    {/* Attendance Radio Toggle */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center gap-6">
                      <span className="text-base text-earth-accent leading-none">{t.rsvpUnderPines}</span>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          id="btn-attend"
                          onClick={() => setRsvpState({ ...rsvpState, attendance: 'attending' })}
                          className={`px-5 py-2 rounded-full text-xs font-sans tracking-wide border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                            rsvpState.attendance === 'attending' 
                            ? 'bg-earth-dark text-raw-earth border-earth-dark' 
                            : 'bg-transparent text-earth-dark/60 border-earth-dark/15 hover:border-earth-dark hover:text-earth-dark'
                          }`}
                        >
                          <Check size={12} className={rsvpState.attendance === 'attending' ? 'opacity-100' : 'opacity-0'} />
                          <span>{t.rsvpWillBeThere}</span>
                        </button>

                        <button
                          type="button"
                          id="btn-decline"
                          onClick={() => setRsvpState({ ...rsvpState, attendance: 'declined' })}
                          className={`px-5 py-2 rounded-full text-xs font-sans tracking-wide border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                            rsvpState.attendance === 'declined' 
                            ? 'bg-earth-dark text-raw-earth border-earth-dark' 
                            : 'bg-transparent text-earth-dark/60 border-earth-dark/15 hover:border-earth-dark hover:text-earth-dark'
                          }`}
                        >
                          <Check size={12} className={rsvpState.attendance === 'declined' ? 'opacity-100' : 'opacity-0'} />
                          <span>{t.rsvpRegretfullyDecline}</span>
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {rsvpState.attendance === 'attending' && (
                        <motion.div
                          key="form-fields-attending"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-6 pt-4 overflow-hidden"
                        >
                          {/* Meal Preference Selection */}
                          <div className="flex flex-col gap-2">
                            <label htmlFor="meal-select" className="text-sm font-sans tracking-widest text-[#6E6A5F] uppercase leading-none mb-1">
                              {t.rsvpMealSelectionLabel}
                            </label>
                            
                            <div className="relative">
                              <select
                                id="meal-select"
                                value={rsvpState.meal}
                                onChange={(e) => setRsvpState({ ...rsvpState, meal: e.target.value })}
                                className="w-full py-3 px-4 bg-transparent border border-earth-dark/20 focus:outline-none focus:border-olive-drab rounded-xl font-serif text-sm italic appearance-none cursor-pointer text-earth-dark"
                              >
                                <option value="woodfired-trout">{t.rsvpMealTrout}</option>
                                <option value="cow-heifer">{t.rsvpMealBeef}</option>
                                <option value="barley-ash">{t.rsvpMealBarley}</option>
                                <option value="raw-greens">{t.rsvpMealGreens}</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-earth-accent">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>

                          {/* Dietary list input */}
                          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap">
                            <label htmlFor="dietary-input" className="text-base text-earth-accent">
                              {t.rsvpDietaryLabel}
                            </label>
                            <input 
                              id="dietary-input"
                              type="text" 
                              placeholder={t.rsvpDietaryPlaceholder}
                              value={rsvpState.dietary}
                              onChange={(e) => setRsvpState({ ...rsvpState, dietary: e.target.value })}
                              className="py-1 bg-transparent border-b border-earth-dark/20 text-sm text-earth-dark placeholder-neutral-400 focus:outline-none focus:border-olive-drab transition-colors flex-1 font-serif italic text-center md:text-left min-w-[200px]"
                            />
                          </div>

                          {/* Wooden Floor Song Input */}
                          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap pt-2">
                            <label htmlFor="song-input" className="text-base text-earth-accent">
                              {t.rsvpSongLabel}
                            </label>
                            <input 
                              id="song-input"
                              type="text" 
                              placeholder={t.rsvpSongPlaceholder}
                              value={rsvpState.songRequest}
                              onChange={(e) => setRsvpState({ ...rsvpState, songRequest: e.target.value })}
                              className="py-1 bg-transparent border-b border-earth-dark/20 text-sm text-earth-dark placeholder-neutral-400 focus:outline-none focus:border-olive-drab transition-colors flex-1 font-serif italic text-center md:text-left min-w-[200px]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Simple Message greeting note */}
                    <div className="flex flex-col gap-2 pt-2">
                      <label htmlFor="greeting-text" className="text-[10px] tracking-widest font-sans font-semibold uppercase text-earth-accent">
                        {t.rsvpGreetingLabel}
                      </label>
                      <textarea
                        id="greeting-text"
                        rows={3}
                        placeholder={t.rsvpGreetingPlaceholder}
                        value={rsvpState.greeting}
                        onChange={(e) => setRsvpState({ ...rsvpState, greeting: e.target.value })}
                        className="w-full p-4 bg-transparent border border-earth-dark/15 focus:outline-none focus:border-olive-drab rounded-xl font-serif text-sm italic placeholder-neutral-400 leading-relaxed text-earth-dark resize-none"
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        id="submit-rsvp"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3.5 px-8 py-4 rounded-xl bg-earth-dark text-raw-earth hover:bg-earth-dark/95 transition-all duration-300 font-sans text-xs tracking-[0.25em] font-semibold active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4.5 h-4.5 border-2 border-dashed border-white/80 rounded-full animate-spin"></div>
                            <span>{t.rsvpTransmitting}</span>
                          </>
                        ) : (
                          <>
                            <span>{t.rsvpCommitEntry}</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="rsvp-thankyou-container"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="rounded-3xl border border-earth-dark/10 p-8 md:p-14 bg-raw-earth shadow-lg text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MinimalRoseDetail />
                  </div>
                  
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-olive-light/10 text-olive-drab mb-6 animate-bounce">
                    <Heart size={26} className="fill-olive-drab/20" />
                  </div>

                  <span className="font-sans text-[10px] tracking-[0.4em] text-olive-drab uppercase block mb-3">
                    {t.thankYouEntryLogged}
                  </span>
                  
                  <p className="font-handwriting text-5xl md:text-6xl text-earth-accent my-6 leading-tight select-text">
                    {t.thankYouTitle}
                  </p>

                  <p className="font-serif text-base text-neutral-600 font-light max-w-md mx-auto leading-relaxed mb-8 select-text">
                    {t.thankYouDesc}
                  </p>

                  {rsvpState.attendance === 'attending' && (
                    <div className="p-4 rounded-xl border border-olive-light/10 bg-olive-light/5 text-xs text-olive-drab font-sans tracking-wide max-w-sm mx-auto mb-8">
                      <p className="font-semibold uppercase mb-1">{t.thankYouMealPlatter}</p>
                      <p className="font-serif italic text-earth-dark/80 text-sm">
                        {rsvpState.meal === 'woodfired-trout' && t.rsvpMealTrout}
                        {rsvpState.meal === 'cow-heifer' && t.rsvpMealBeef}
                        {rsvpState.meal === 'barley-ash' && t.rsvpMealBarley}
                        {rsvpState.meal === 'raw-greens' && t.rsvpMealGreens}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={resetRsvp}
                      type="button"
                      id="edit-rsvp-btn"
                      className="px-6 py-2.5 rounded-full border border-earth-dark/20 text-xs font-sans tracking-widest text-[#6E6A5F] hover:text-earth-dark hover:border-earth-dark transition-all duration-300 cursor-pointer"
                    >
                      {t.thankYouEditBtn}
                    </button>
                    
                    <a
                      href="#details"
                      className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold tracking-widest hover:underline text-earth-dark"
                    >
                      <span>{t.thankYouRevisitDirections}</span>
                      <ArrowRight size={12} />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-earth-dark/5 py-12 text-center text-[10px] tracking-[0.3em] font-sans text-[#6E6A5F]/70 select-text">
        <p className="uppercase mb-2">{t.weddingName} • {lang === 'ENG' ? 'October 10, 2026' : '10 tháng 10, 2026'}</p>
        <p className="font-serif italic tracking-normal text-xs text-earth-accent lowercase mb-4">{t.footerUnionText}</p>
        <div className="flex justify-center items-center gap-2 text-[10px]">
          <span className="opacity-25 select-none">•</span>
          <a
            href="#admin"
            className="hover:text-earth-dark text-[#6E6A5F]/40 hover:text-[#6E6A5F]/90 transition-colors uppercase tracking-[0.25em] font-sans text-[8px] flex items-center gap-1 leading-none select-none"
            title="Registry Logbook"
          >
            <Lock size={8} className="stroke-[2.5]" />
            <span>{t.footerRegistryLedger}</span>
          </a>
          <span className="opacity-25 select-none">•</span>
        </div>
      </footer>

    </div>
  );
}
