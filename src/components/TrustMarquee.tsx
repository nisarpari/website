'use client';


import { motion } from 'framer-motion';

export default function TrustMarquee() {

    const badges = [
        { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Genuine Products' },
        { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Fast Delivery' },
        { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Official Warranty' },
        { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label: 'Expert Support' },
        { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Secure Payments' },
        { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Easy Returns' },
    ];

    // We duplicate the array to create a seamless loop
    const marqueeItems = [...badges, ...badges, ...badges];

    return (
        <section className="bg-white dark:bg-navy py-12 border-b border-bella-100 dark:border-white/5 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-navy to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-navy to-transparent z-10" />

            <div className="flex">
                <motion.div
                    className="flex flex-nowrap gap-16"
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {marqueeItems.map((badge, i) => (
                        <div key={i} className="flex items-center gap-4 flex-shrink-0 group cursor-default">
                            <div className="w-12 h-12 bg-bella-50 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-300">
                                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={badge.icon} />
                                </svg>
                            </div>
                            <span className="text-base font-medium text-navy dark:text-white whitespace-nowrap group-hover:text-gold transition-colors duration-300">
                                {badge.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
