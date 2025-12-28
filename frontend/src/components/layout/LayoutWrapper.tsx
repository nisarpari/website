'use client';

import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OdooAPI, type Category } from '@/lib/api/odoo';
import { useAdmin } from '@/context';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

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
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
