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
  Filter
} from 'lucide-react';
import { db, storage, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { translations, type Translations } from './translations';

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
    <path d="M 60,60 C 50,45 40,40 30,50 C 20,60 30,70 45,65 C 30,75 25,85 35,95 C 45,105 55,90 55,75 C 60,95 70,105 80,95 C 90,85 85,75 70,65 C 85,70 95,60 85,50 C 75,40 65,45 55,60 Z" />
    <path d="M 60,60 C 65,55 70,45 65,35 C 60,25 50,30 55,45" />
    <circle cx="60" cy="61" r="3" className="fill-earth-accent" />
  </svg>
);

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
  const [heroImageUrl, setHeroImageUrl] = useState<string>('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200');
  const [isContentLoading, setIsContentLoading] = useState<boolean>(true);

  // States for CMS Panel in Admin view
  const [adminTab, setAdminTab] = useState<'rsvps' | 'cms'>('rsvps');
  const [cmsLang, setCmsLang] = useState<'ENG' | 'VIE'>('ENG');
  const [cmsSection, setCmsSection] = useState<'hero' | 'details' | 'map' | 'story' | 'rsvp' | 'thankyou' | 'utils'>('hero');
  const [cmsTranslations, setCmsTranslations] = useState<Record<'ENG' | 'VIE', Translations>>(translations);
  const [cmsImageUrl, setCmsImageUrl] = useState<string>('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSavingContent, setIsSavingContent] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const t = siteContent[lang];

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

          if (data.imageUrl) {
            setHeroImageUrl(data.imageUrl);
            setCmsImageUrl(data.imageUrl);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Only image files (.jpg, .png, etc.) are permitted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size allowed is 5MB.');
        return;
      }
      startUpload(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Only image files (.jpg, .png, etc.) are permitted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size allowed is 5MB.');
        return;
      }
      startUpload(file);
    }
  };

  const startUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `site_assets/couple_portrait_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Storage upload error:', error);
        alert(`Failed to upload: ${error.message}`);
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setCmsImageUrl(downloadUrl);
          setIsUploading(false);
        } catch (err: any) {
          console.error('Error getting download URL:', err);
          alert(`Error getting download URL: ${err.message}`);
          setIsUploading(false);
        }
      }
    );
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
        updatedAt: new Date().toISOString(),
      });

      // Update active live states of the landing page
      setSiteContent(cmsTranslations);
      setHeroImageUrl(cmsImageUrl);

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

  const [activeSection, setActiveSection] = useState<'hero' | 'details' | 'story' | 'rsvp'>('hero');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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

  // Interaction Intersection Observer to highlight sidebar Roman numerals automatically
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'details', 'story', 'rsvp'] as const;
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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
                <h1 className="font-serif text-4xl font-light text-earth-dark select-text">
                  The Guestbook Registry
                </h1>
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
            <div className="flex border-b border-earth-dark/10 mb-8 gap-6">
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
            </div>

            {/* Error alerts if firebase collection can't load */}
            {fetchingRsvpsError && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-red-700 text-sm font-serif italic text-center">
                <p className="font-semibold">Unable to fetch wedding registries:</p>
                <p className="text-xs opacity-90 mt-1 font-mono">{fetchingRsvpsError}</p>
              </div>
            )}

            {adminTab === 'rsvps' ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            {/* Left Column: Image Asset Swap / Firebase Storage Section */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#FAF8F5]/80 backdrop-blur-xs border border-earth-dark/5 rounded-2xl p-6 shadow-xs text-left">
                <h2 className="font-serif text-lg font-light text-earth-dark mb-4 pb-2 border-b border-earth-dark/5 select-text">
                  I. Homepage Portrait Swap
                </h2>
                <p className="font-sans text-[11px] text-[#6E6A5F] leading-relaxed mb-4 select-text">
                  Update the main featured picture on the landing page of the wedding. Drag-and-drop or choose a new .jpg/.png portrait asset.
                </p>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] ${
                    isDragging 
                      ? 'border-olive-drab bg-olive-light/10 scale-[0.99] shadow-inner' 
                      : 'border-earth-dark/20 hover:border-olive-drab bg-white/30'
                  }`}
                >
                  <input
                    type="file"
                    id="cms-file-upload"
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title=""
                  />
                  <Smile size={24} className="text-earth-dark/40 mb-3 animate-bounce" />
                  <span className="font-sans text-xs font-semibold text-earth-dark uppercase tracking-widest block mb-1">
                    FILE DROP ZONE
                  </span>
                  <span className="font-serif text-[11px] text-[#6E6A5F] italic">
                    Or click to choose image file
                  </span>
                </div>

                {/* Upload progress feedback */}
                {isUploading && (
                  <div className="mt-4 p-3 bg-stone-100 rounded-xl border border-earth-dark/5">
                    <div className="flex justify-between items-center text-[10px] font-sans font-bold text-earth-accent mb-1 uppercase tracking-wider">
                      <span>Uploading image...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-olive-drab h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Preview Current Image Block */}
                <div className="mt-6">
                  <span className="font-sans text-[9px] tracking-widest text-[#6E6A5F] uppercase block mb-3 font-semibold">
                    ACTIVE IMAGE PORTRAIT PREVIEW:
                  </span>
                  <div className="relative p-2 bg-[#FAF8F5] border border-earth-dark/10 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] w-full">
                    <div className="relative rounded-lg overflow-hidden aspect-[4/5] bg-stone-100">
                      <img 
                        src={cmsImageUrl} 
                        alt="CMS Preview Portal" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Web Content Modification Form */}
            <div className="lg:col-span-8">
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
                    disabled={isSavingContent || isUploading}
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
                    <option value="map">Part III // Watercolor Sketch Map Labels</option>
                    <option value="story">Part IV // Path Taken (Historical Milestones)</option>
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
                      <div className="md:col-span-2">{renderTextInput("Map Interaction Overlay Banner", "interactiveMapBadge")}</div>
                      {renderTextInput("Map Fork Label Details", "mapSiletzRiver")}
                      {renderTextInput("Map Route Guard Label Details", "mapForestPass")}
                      {renderTextInput("Map Point I: Ceremony Pin Title", "mapWestRidgeLabel")}
                      {renderTextInput("Map Point I: Ceremony Information Subtext", "mapWestRidgeSub")}
                      {renderTextInput("Map Point II: Gathering Pin Title", "mapGlassBarnLabel")}
                      {renderTextInput("Map Point II: Gathering Information Subtext", "mapGlassBarnSub")}
                      <div className="md:col-span-2">{renderTextInput("Directions Navigation URL Map link text", "mapGetDirections")}</div>
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
                </div>

                <div className="border-t border-earth-dark/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <span className="text-[10px] text-neutral-400 italic font-serif">
                    Pushing changes merges translation dictionaries across database shards instantly.
                  </span>

                  <button
                    type="submit"
                    disabled={isSavingContent || isUploading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-olive-drab hover:bg-[#4E4B42] text-white tracking-widest font-sans text-xs font-bold transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    <span>✓ SAVE &amp; BUILD SITE</span>
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
          href="#rsvp" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'rsvp' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">IV.</span> 
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

      {/* Main Content Lookbook wrapper - meticulously padded */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:pl-32 lg:pr-12 py-12">
        
        {/* SEC I: HERO SECTION */}
        <section 
          id="hero" 
          className="min-h-[92vh] flex flex-col justify-between pt-16 pb-24 relative"
        >
          {/* Header Accent Meta line */}
          <div className="flex flex-col gap-2 items-start opacity-0 animate-letter-spacing-unfold">
            <span className="text-[10px] tracking-[0.35em] font-sans text-earth-accent uppercase leading-none">
              {t.gatheringHeader}
            </span>
            <span className="text-xs font-serif italic text-earth-accent font-light">
              {t.gatheringSub}
            </span>
          </div>

          {/* Core Title (Names of Couple) & Dynamic Image */}
          <div className="my-auto py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <h1 className="text-[10vw] sm:text-[7vw] lg:text-[5vw] font-serif font-light leading-[1.05] tracking-tight mb-6 select-text">
                  {t.weddingName}
                </h1>
                
                {/* The Vibe Narrative Block */}
                <p className="max-w-md font-serif text-lg md:text-xl text-earth-accent font-light leading-relaxed mb-8 select-text">
                  {t.heroVibeText}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 mt-4 font-sans text-[11px] tracking-[0.25em] text-earth-dark/70">
                  <div className="flex items-center gap-3">
                    <span className="text-olive-light">10</span>
                    <span>{t.october}</span>
                  </div>
                  <div className="hidden sm:inline text-earth-dark/20">•</div>
                  <div className="flex items-center gap-3">
                    <span>{t.portland}</span>
                  </div>
                  <div className="hidden sm:inline text-earth-dark/20">•</div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif italic font-normal text-xs text-earth-dark lowercase">{t.wildMeadow}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Image Canvas Frame */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative p-2.5 bg-[#FAF8F5] border border-earth-dark/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] group max-w-sm w-full">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-stone-100">
                    <img 
                      src={heroImageUrl} 
                      alt="Gia Bao & John Portrait" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Countdown Timer Section */}
          <div className="border-t border-earth-dark/10 pt-8 flex grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="absolute right-0 top-0 -translate-y-12 block lg:hidden">
              <MinimalRoseDetail />
            </div>

            {/* Countdown Days */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">{t.countdownDays}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.days}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.days)}</span>
              </div>
            </div>

            {/* Countdown Hours */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">{t.countdownHours}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.hours}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.hours)}</span>
              </div>
            </div>

            {/* Countdown Minutes */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">{t.countdownMinutes}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.minutes}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.minutes)}</span>
              </div>
            </div>

            {/* Countdown Seconds */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">{t.countdownSeconds}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.seconds}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.seconds)}</span>
              </div>
            </div>
          </div>
        </section>


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
              
              <div className="relative rounded-2xl border border-earth-dark/10 p-4 md:p-6 bg-raw-earth shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full border border-earth-dark/10 bg-raw-earth/80 backdrop-blur-sm text-[9px] tracking-widest font-sans uppercase">
                  <Compass size={11} className="text-earth-dark/60" />
                  <span>{t.interactiveMapBadge}</span>
                </div>

                {/* Hand Drawn Organic Map Vector Design */}
                <svg 
                  viewBox="0 0 500 400" 
                  className="w-full h-auto stroke-earth-dark fill-none stroke-[1.2] rounded-xl"
                  aria-label="Map illustration of Whispering Meadow Grounds"
                >
                  {/* Subtle Background contour lines */}
                  <path d="M 10,250 C 150,230 250,300 490,260" className="stroke-neutral-300 stroke-[0.8] stroke-dasharray-[4,4]" />
                  <path d="M 10,120 C 140,150 300,100 490,140" className="stroke-neutral-300 stroke-[0.8]" />
                  <path d="M 10,50 Q 230,80 490,30" className="stroke-neutral-300 stroke-[0.5]" />
                  
                  {/* The river */}
                  <path d="M -20,380 C 120,360 210,220 280,180 C 350,140 400,60 520,30" className="stroke-olive-light stroke-[2.2] opacity-40" />
                  <text x="350" y="85" className="font-serif italic text-[10px] fill-olive-light font-light stroke-none scale-x-[0.95]">{t.mapSiletzRiver}</text>

                  {/* Meandering Forest dirt road */}
                  <path d="M 120,420 C 140,300 80,240 180,190 C 260,150 280,80 340,-20" className="stroke-earth-accent/40 stroke-[1.2] stroke-dasharray-[5,5]" />
                  <text x="105" y="380" className="font-sans text-[8px] tracking-widest fill-earth-accent/70 font-light stroke-none rotate-[-60deg]">{t.mapForestPass}</text>

                  {/* Beacons and details */}
                  {/* PIN I: The Western Ridge (Ceremony Location) */}
                  <g transform="translate(190, 185)">
                    {/* Ring Pulse 1 */}
                    <circle cx="0" cy="0" r="14" className="stroke-olive-drab stroke-[1] fill-none animate-[ping_3s_infinite_ease-in-out]" />
                    <circle cx="0" cy="0" r="4" className="fill-olive-drab stroke-none pulse-dot" />
                    
                    {/* Hand drawn custom marker label banner */}
                    <rect x="12" y="-20" width="138" height="34" rx="4" className="fill-raw-earth/95 stroke-earth-dark/15 stroke-[0.8]" />
                    <text x="20" y="-8" className="font-sans text-[9px] font-semibold fill-earth-dark stroke-none tracking-wider">{t.mapWestRidgeLabel}</text>
                    <text x="20" y="4" className="font-serif italic text-[9px] fill-earth-accent/95 stroke-none leading-none">{t.mapWestRidgeSub}</text>
                  </g>

                  {/* PIN II: The Glass Barn Reception */}
                  <g transform="translate(305, 120)">
                    {/* Ring Pulse 2 */}
                    <circle cx="0" cy="0" r="14" className="stroke-earth-accent stroke-[1] fill-none animate-[ping_4s_infinite_ease-in-out]" />
                    <circle cx="0" cy="0" r="4" className="fill-earth-dark stroke-none pulse-dot" />
                    
                    {/* Label banner */}
                    <rect x="12" y="-12" width="138" height="34" rx="4" className="fill-raw-earth/95 stroke-earth-dark/15 stroke-[0.8]" />
                    <text x="20" y="0" className="font-sans text-[9px] font-semibold fill-earth-dark stroke-none tracking-wider">{t.mapGlassBarnLabel}</text>
                    <text x="20" y="12" className="font-serif italic text-[9px] fill-olive-drab stroke-none leading-none">{t.mapGlassBarnSub}</text>
                  </g>

                  {/* Pines sketches */}
                  {/* Pine 1 */}
                  <g transform="translate(60, 160)">
                    <path d="M 0,20 L 0,-10 L -6,2 L 0,-10 L 6,2" />
                    <path d="M 0,-10 L -4,-18 L 0,-10 L 4,-18" />
                  </g>
                  {/* Pine 2 */}
                  <g transform="translate(85, 175)">
                    <path d="M 0,15 L 0,-7 L -4,1 L 0,-7 L 4,1" />
                  </g>
                  {/* Pine 3 */}
                  <g transform="translate(420, 290)">
                    <path d="M 0,24 L 0,-12 L -7,1 L 0,-12 L 7,1" />
                    <path d="M 0,-12 L -5,-20 L 0,-12 L 5,-20" />
                  </g>
                  {/* Compass star motif */}
                  <g transform="translate(50, 60)">
                    <circle cx="0" cy="0" r="15" className="stroke-earth-accent/20" />
                    <path d="M 0,-18 L 0,18 M -18,0 L 18,0" className="stroke-earth-accent/50" />
                    <polygon points="0,-12 3,0 0,2 0,-12" className="fill-earth-dark stroke-none" />
                    <polygon points="0,12 -3,0 0,-2 0,12" className="fill-earth-accent stroke-none" />
                    <text x="0" y="-22" textAnchor="middle" className="font-sans text-[8px] fill-earth-dark font-medium stroke-none">N</text>
                  </g>
                </svg>

                <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs text-earth-accent font-light">
                  <span className="flex items-center gap-2">
                    <MapPin size={13} className="text-olive-drab shrink-0" />
                    <span>Latitude: 45.4192° N, Longitude: 122.1824° W</span>
                  </span>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-earth-dark font-medium font-sans tracking-wide text-[10px] uppercase"
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
