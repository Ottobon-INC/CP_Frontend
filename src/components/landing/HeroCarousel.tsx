import React, { useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';

import humanLoopImg from '@/assets/human-loop.png';
import aiAssistantImg from '@/assets/ai-assistant.png';
import assessmentImg from '@/assets/assessment.png';
import personaLearningImg from '@/assets/persona-learning.png';
import peerInsightImg from '@/assets/peer-insight.png';
import cohortEngagementImg from '@/assets/cohort-engagement.png';

import contentData from '@/content.json';

const { heroSection } = contentData;

export interface HeroVariant {
    prefix: string;
    highlight: string;
    sub: string;
}

// --- Slide 1 ---

const HeroSlide: React.FC<{
  onEnroll: () => void;
  onSearch: (term: string) => void;
  showPrimaryCta?: boolean;
  variant?: HeroVariant;
  slide1?: typeof heroSection.slide1;
}> = ({ onEnroll, showPrimaryCta = true, variant, slide1 = heroSection.slide1 }) => {
    const ref = useRef<HTMLDivElement>(null);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div ref={ref} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-retro-bg via-white to-retro-sage/20 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
            </div>

            <div className="w-full pl-6 md:pl-20 pr-6 z-10 relative grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 flex flex-col justify-center h-full items-center md:items-start text-center md:text-left"
                >
                    <motion.div>
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-7xl font-bold text-retro-teal tracking-tight leading-[1.1] break-words"
                            variants={itemVariants}
                        >
                            {variant ? variant.prefix : heroSection.variant.prefix} <br />
                            <span className="text-retro-salmon inline-block relative">
                                {variant ? variant.highlight : heroSection.variant.highlight}
                                <motion.svg
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 1, duration: 1.5 }}
                                    className="absolute -bottom-2 left-0 w-full"
                                    height="10" viewBox="0 0 200 10" fill="none" xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2 8Q100 2 198 8" stroke="#90AEAD" strokeWidth="4" strokeLinecap="round" />
                                </motion.svg>
                            </span>
                        </motion.h1>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-retro-teal/80 max-w-xl leading-relaxed break-words"
                    >
                        {variant ? variant.sub : heroSection.variant.sub}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start gap-6 pt-2">
                        <div className={`flex flex-col sm:flex-row gap-4 ${showPrimaryCta ? '' : 'justify-center self-center'}`}>
                            {showPrimaryCta && (
                                <motion.button
                                    onClick={onEnroll}
                                    whileHover={{ scale: 1.03, boxShadow: "0px 10px 25px rgba(230, 72, 51, 0.25)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-retro-salmon text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-retro-salmon/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {slide1.primaryCta} <ArrowRight size={20} />
                                </motion.button>
                            )}
                            <button
                                onClick={() => {
                                    const el = document.getElementById('how');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-retro-teal/30 bg-transparent px-8 py-4 font-semibold text-retro-teal transition-all hover:border-retro-teal hover:shadow-md ${showPrimaryCta ? '' : 'mx-auto'}`}
                            >
                                {slide1.secondaryCta}
                                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-retro-teal/60 font-medium flex-wrap">
                            {slide1.trustSignals.map((signal, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-retro-salmon shrink-0"></div>
                                    {signal}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right: 3D Cube */}
                <div className="hidden md:flex justify-center items-center h-full min-h-[400px]">
                    <div className="cube-container">
                        <div className="box-card">
                            <div className="face front" style={{ '--img': `url(${cohortEngagementImg})` } as React.CSSProperties}></div>
                            <div className="face back" style={{ '--img': `url(${peerInsightImg})` } as React.CSSProperties}></div>
                            <div className="face right" style={{ '--img': `url(${personaLearningImg})` } as React.CSSProperties}></div>
                            <div className="face left" style={{ '--img': `url(${assessmentImg})` } as React.CSSProperties}></div>
                            <div className="face top" style={{ '--img': `url(${aiAssistantImg})` } as React.CSSProperties}></div>
                            <div className="face bottom" style={{ '--img': `url(${humanLoopImg})` } as React.CSSProperties}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main HeroCarousel ---

interface HeroCarouselProps {
    onEnroll: () => void;
    onSearch: (term: string) => void;
    heroVariant?: HeroVariant;
    showPrimaryCta?: boolean;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onEnroll, onSearch, heroVariant, showPrimaryCta = true }) => {
    return (
        <div
            className="relative w-full overflow-hidden bg-retro-bg"
            style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}
        >
            <HeroSlide onEnroll={onEnroll} onSearch={onSearch} showPrimaryCta={showPrimaryCta} variant={heroVariant} />
        </div>
    );
};

export default HeroCarousel;
