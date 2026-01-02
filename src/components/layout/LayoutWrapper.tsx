'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OdooAPI, type Category } from '@/lib/api/odoo';
import { useAdmin } from '@/context';
import { duration, easing } from '@/lib/animations';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Page entrance animation
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.luxuryOut,
    },
  },
};

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await OdooAPI.fetchPublicCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-bella-50 ${isAdmin ? 'pt-10' : ''}`}>
      <Navbar categories={categories} />
      <motion.main
        className="flex-1"
        initial="initial"
        animate="animate"
        variants={pageTransition}
      >
        {children}
      </motion.main>
      <Footer categories={categories} />
    </div>
  );
}
