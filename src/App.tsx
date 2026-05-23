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
  Smile
} from 'lucide-react';

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
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpState.name.trim()) return;

    setIsSubmitting(true);
    
    // Simulate real database store or secure callback
    setTimeout(() => {
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
        timestamp: new Date().toISOString()
      }));
    }, 1500);
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
        <button
          onClick={toggleAudio}
          type="button"
          id="sound-toggle"
          aria-label="Toggle atmospheric sound loop"
          className="p-3.5 rounded-full border border-earth-accent/20 bg-raw-earth/75 backdrop-blur-md hover:bg-earth-dark hover:text-raw-earth hover:border-transparent transition-all duration-300 shadow-sm cursor-pointer"
        >
          {isPlayingAudio ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-sans uppercase">AMBIENT ON</span>
              <Volume2 size={13} className="animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest opacity-60 font-sans uppercase">PLAY NATURE ACCENT</span>
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
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">THE DATE</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'hero' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#details" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'details' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">II.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">THE DETAILS</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'details' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#story" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'story' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">III.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">OUR STORY</span>
          <span className={`w-1.5 h-1.5 rounded-full bg-earth-dark transition-transform duration-300 ${activeSection === 'story' ? 'scale-100' : 'scale-0'}`}></span>
        </a>

        <a 
          href="#rsvp" 
          className={`flex items-center gap-3 transition-all duration-500 group ${activeSection === 'rsvp' ? 'text-earth-dark font-medium' : 'text-earth-dark/40 hover:text-earth-dark'}`}
        >
          <span className="font-serif">IV.</span> 
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">RSVP</span>
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
          <span>RSVP</span>
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
              Gathering for the Gathering
            </span>
            <span className="text-xs font-serif italic text-earth-accent font-light">
              Under the changing light of October
            </span>
          </div>

          {/* Core Title (Names of Couple) */}
          <div className="my-auto py-12 md:py-16">
            <h1 className="text-[12vw] sm:text-[8vw] lg:text-[6.5vw] font-serif font-light leading-[1.05] tracking-tight mb-6 select-text">
              Gia Bao <br className="sm:hidden" />
              <span className="text-earth-accent italic font-normal">&amp;</span> John
            </h1>
            
            {/* The Vibe Narrative Block */}
            <p className="max-w-md font-serif text-lg md:text-xl text-earth-accent font-light leading-relaxed mb-8 select-text">
              Invite you to share in a quiet weekend of woodfire, forest walks, and the commitment of vows.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-4 font-sans text-[11px] tracking-[0.25em] text-earth-dark/70">
              <div className="flex items-center gap-3">
                <span className="text-olive-light">10</span>
                <span>OCTOBER, 2026</span>
              </div>
              <div className="hidden sm:inline text-earth-dark/20">•</div>
              <div className="flex items-center gap-3">
                <span>PORTLAND, OREGON</span>
              </div>
              <div className="hidden sm:inline text-earth-dark/20">•</div>
              <div className="flex items-center gap-3">
                <span className="font-serif italic font-normal text-xs text-earth-dark lowercase">the wild meadow</span>
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
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">Days</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.days}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.days)}</span>
              </div>
            </div>

            {/* Countdown Hours */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">Hours</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.hours}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.hours)}</span>
              </div>
            </div>

            {/* Countdown Minutes */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">Minutes</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl md:text-3xl font-light">{countdown.minutes}</span>
                <span className="text-[10px] font-sans text-olive-light font-light uppercase">{formatToRoman(countdown.minutes)}</span>
              </div>
            </div>

            {/* Countdown Seconds */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] font-sans text-earth-accent uppercase mb-2">Seconds</span>
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
                02 // The Gathering Grounds
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight leading-none">
                Where the <br />
                world slows down.
              </h2>
              <p className="font-serif text-neutral-600 font-light leading-relaxed text-base select-text">
                The ceremony and celebratory feast will both be hosted at the <span className="text-earth-dark font-medium italic">Whispering Meadow Ranch</span>. An isolated oasis wrapped in centuries-old fir pines, located thirty miles east of the Portland Gorge.
              </p>

              {/* Ceremony Detail Block */}
              <div className="mt-8 border-l-2 border-olive-drab/25 pl-6 py-2 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-olive-drab" />
                  <span className="text-xs tracking-[0.18em] font-sans font-semibold uppercase text-earth-dark">THE CEREMONY</span>
                </div>
                <p className="font-serif italic text-sm text-earth-accent">
                  Four P.M. Under the giant Oak on the West Ridge. Suitable footwear for mountain turf recommended.
                </p>
              </div>

              {/* Reception Detail Block */}
              <div className="border-l-2 border-olive-drab/25 pl-6 py-2 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Utensils size={15} className="text-olive-drab" />
                  <span className="text-xs tracking-[0.18em] font-sans font-semibold uppercase text-earth-dark">THE GATHERING & FEAST</span>
                </div>
                <p className="font-serif italic text-sm text-earth-accent">
                  To follow immediately within the wooden Glass Barn. Fine organic wines, locally-foraged culinary boards, clay ovens, forest breeze.
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-olive-drab/80 mt-2 font-mono bg-olive-light/5 p-3 rounded border border-olive-light/10">
                <Info size={14} className="shrink-0" />
                <span>Accommodation details & guidelines available upon request.</span>
              </div>
            </div>

            {/* Stylized Map View SVG Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="relative rounded-2xl border border-earth-dark/10 p-4 md:p-6 bg-raw-earth shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full border border-earth-dark/10 bg-raw-earth/80 backdrop-blur-sm text-[9px] tracking-widest font-sans uppercase">
                  <Compass size={11} className="text-earth-dark/60" />
                  <span>Interactive Map & Trails</span>
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
                  <text x="350" y="85" className="font-serif italic text-[10px] fill-olive-light font-light stroke-none scale-x-[0.95]">Siletz River Fork</text>

                  {/* Meandering Forest dirt road */}
                  <path d="M 120,420 C 140,300 80,240 180,190 C 260,150 280,80 340,-20" className="stroke-earth-accent/40 stroke-[1.2] stroke-dasharray-[5,5]" />
                  <text x="105" y="380" className="font-sans text-[8px] tracking-widest fill-earth-accent/70 font-light stroke-none rotate-[-60deg]">Whispering Forest Pass</text>

                  {/* Beacons and details */}
                  {/* PIN I: The Western Ridge (Ceremony Location) */}
                  <g transform="translate(190, 185)">
                    {/* Ring Pulse 1 */}
                    <circle cx="0" cy="0" r="14" className="stroke-olive-drab stroke-[1] fill-none animate-[ping_3s_infinite_ease-in-out]" />
                    <circle cx="0" cy="0" r="4" className="fill-olive-drab stroke-none pulse-dot" />
                    
                    {/* Hand drawn custom marker label banner */}
                    <rect x="12" y="-20" width="138" height="34" rx="4" className="fill-raw-earth/95 stroke-earth-dark/15 stroke-[0.8]" />
                    <text x="20" y="-8" className="font-sans text-[9px] font-semibold fill-earth-dark stroke-none tracking-wider">I. WEST RIDGE</text>
                    <text x="20" y="4" className="font-serif italic text-[9px] fill-earth-accent/95 stroke-none leading-none">The Ceremony — 4:00 PM</text>
                  </g>

                  {/* PIN II: The Glass Barn Reception */}
                  <g transform="translate(305, 120)">
                    {/* Ring Pulse 2 */}
                    <circle cx="0" cy="0" r="14" className="stroke-earth-accent stroke-[1] fill-none animate-[ping_4s_infinite_ease-in-out]" />
                    <circle cx="0" cy="0" r="4" className="fill-earth-dark stroke-none pulse-dot" />
                    
                    {/* Label banner */}
                    <rect x="12" y="-12" width="138" height="34" rx="4" className="fill-raw-earth/95 stroke-earth-dark/15 stroke-[0.8]" />
                    <text x="20" y="0" className="font-sans text-[9px] font-semibold fill-earth-dark stroke-none tracking-wider">II. THE GLASS BARN</text>
                    <text x="20" y="12" className="font-serif italic text-[9px] fill-olive-drab stroke-none leading-none">Feast &amp; Hearth — 5:30 PM</text>
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
                    <span>Get Directions</span>
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
              03 // The Path Taken
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-12 leading-tight">
              A commitment born under open sky, carried by the seasons.
            </h2>

            {/* Editorial asymmetric layout */}
            <div className="space-y-12 md:space-y-16">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2021
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">The Whispering Meadow</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    We met on an organic lavender farm on the coast where John was restoring the dry stone slate walls, and Gia Bao was tending the bees. Our first conversations turned into long walks through hemlock branches.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2024
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">The Stone Cottage</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    In the heavy fog of January, we found a moss-covered home and rebuilt the kitchen with timbers felled nearby. Together, we cooked woodfired breads and lived in rhythmic silence with the local crows.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <span className="md:col-span-2 font-serif text-2xl italic text-olive-drab font-light">
                  2026
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-sans text-xs tracking-widest font-semibold uppercase mb-2">The Autumn Vow</h3>
                  <p className="font-serif text-base text-neutral-600 font-light leading-relaxed select-text">
                    Now, with our hearts grounded in the clay of the hills, we wish to commit ourselves in front of those we love most. An intimate union with deep food, rich logs, and rustic laughter.
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
                      IV // THE UNION REGISTRY
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif font-light mb-3 italic">
                      RSVP
                    </h2>
                    <p className="font-sans text-[11px] tracking-widest text-[#6E6A5F] uppercase">
                      Kindly reply by August 15, 2026
                    </p>
                  </div>

                  {/* Aesthetic Physical Journal Style Form */}
                  <form onSubmit={handleRsvpSubmit} className="space-y-8 font-serif leading-10 select-text">
                    
                    {/* Name block input */}
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap">
                      <label htmlFor="name-input" className="text-base text-earth-accent">
                        My full name is
                      </label>
                      <input 
                        id="name-input"
                        type="text" 
                        required
                        placeholder="[ Enter your name here ]"
                        value={rsvpState.name}
                        onChange={(e) => setRsvpState({ ...rsvpState, name: e.target.value })}
                        className="py-1 bg-transparent border-b border-earth-dark/20 text-lg text-earth-dark placeholder-neutral-400 focus:outline-none focus:border-olive-drab transition-colors flex-1 font-serif italic text-center md:text-left min-w-[200px]"
                      />
                    </div>

                    {/* Attendance Radio Toggle */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center gap-6">
                      <span className="text-base text-earth-accent leading-none">Under the autumn pines:</span>
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
                          <span>I WILL BE THERE</span>
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
                          <span>REGRETFULLY DECLINE</span>
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
                              FORGED SEASONAL MEAL SELECTION
                            </label>
                            
                            <div className="relative">
                              <select
                                id="meal-select"
                                value={rsvpState.meal}
                                onChange={(e) => setRsvpState({ ...rsvpState, meal: e.target.value })}
                                className="w-full py-3 px-4 bg-transparent border border-earth-dark/20 focus:outline-none focus:border-olive-drab rounded-xl font-serif text-sm italic appearance-none cursor-pointer text-earth-dark"
                              >
                                <option value="woodfired-trout">Clay-Oven Woodfired Siletz Trout with Foraged Nettles & Wild Sorrel</option>
                                <option value="cow-heifer">Smoked Pine-Tip Alder Ranch Heifer with Saffron-Tossed Root Thyme</option>
                                <option value="barley-ash">Mushroom Barley baked under Ash & Oak-Smoked Salt, Goat Curd (V)</option>
                                <option value="raw-greens">Harvest Heritage Pumpkins with Fermented Nuts, Roasted Herbs (VG)</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-earth-accent">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>

                          {/* Dietary list input */}
                          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap">
                            <label htmlFor="dietary-input" className="text-base text-earth-accent">
                              My dietary requirements include
                            </label>
                            <input 
                              id="dietary-input"
                              type="text" 
                              placeholder="[ e.g. nut allergies, vegan, none ]"
                              value={rsvpState.dietary}
                              onChange={(e) => setRsvpState({ ...rsvpState, dietary: e.target.value })}
                              className="py-1 bg-transparent border-b border-earth-dark/20 text-sm text-earth-dark placeholder-neutral-400 focus:outline-none focus:border-olive-drab transition-colors flex-1 font-serif italic text-center md:text-left min-w-[200px]"
                            />
                          </div>

                          {/* Wooden Floor Song Input */}
                          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 flex-wrap pt-2">
                            <label htmlFor="song-input" className="text-base text-earth-accent">
                              I promise to dance if the forest acoustic plays
                            </label>
                            <input 
                              id="song-input"
                              type="text" 
                              placeholder="[ Nominate a warm song ]"
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
                        Leave a physical journal note for Gia Bao &amp; John
                      </label>
                      <textarea
                        id="greeting-text"
                        rows={3}
                        placeholder="[ Woodfired memories, warm blessings or comments... ]"
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
                            <span>TRANSMITTING REGISTRY...</span>
                          </>
                        ) : (
                          <>
                            <span>COMMIT REGISTRY ENTRY</span>
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
                    REGISTRY ENTRY LOGGED
                  </span>
                  
                  <p className="font-handwriting text-5xl md:text-6xl text-earth-accent my-6 leading-tight select-text">
                    With all our hearts, thank you.
                  </p>

                  <p className="font-serif text-base text-neutral-600 font-light max-w-md mx-auto leading-relaxed mb-8 select-text">
                    We cannot wait to share the quiet gold of October with you in the mountains. Your entry has been recorded in our physical catalog.
                  </p>

                  {rsvpState.attendance === 'attending' && (
                    <div className="p-4 rounded-xl border border-olive-light/10 bg-olive-light/5 text-xs text-olive-drab font-sans tracking-wide max-w-sm mx-auto mb-8">
                      <p className="font-semibold uppercase mb-1">Your Selected Hearth Platter:</p>
                      <p className="font-serif italic text-earth-dark/80 text-sm">
                        {rsvpState.meal === 'woodfired-trout' && 'Clay-Oven Woodfired Siletz Trout & Wild Sorrel'}
                        {rsvpState.meal === 'cow-heifer' && 'Smoked Pine-Tip Alder Ranch Heifer & Thyme'}
                        {rsvpState.meal === 'barley-ash' && 'Mushroom Barley Baked Under Ash (V)'}
                        {rsvpState.meal === 'raw-greens' && 'Harvest Heritage Pumpkins & Herbs (VG)'}
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
                      EDIT REGISTRY DETAILS
                    </button>
                    
                    <a
                      href="#details"
                      className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold tracking-widest hover:underline text-earth-dark"
                    >
                      <span>REVISIT DIRECTIONS</span>
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
        <p className="uppercase mb-2">Gia Bao &amp; John • October 10, 2026</p>
        <p className="font-serif italic tracking-normal text-xs text-earth-accent lowercase">Union among hemlock &amp; stone</p>
      </footer>

    </div>
  );
}
