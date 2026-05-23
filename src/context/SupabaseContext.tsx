import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { initialData } from '../data';

interface AppContextType {
  user: any;
  programs: any[];
  activities: any[];
  assessments: any[];
  documentation: any[];
  actions: any[];
  feedback: any[];
  classes: any[];
  teachers: any[];
  loading: boolean;
  useFallback: boolean;
  refreshData: () => Promise<void>;
  updateItem: (table: string, id: string, updates: any) => Promise<void>;
  insertItem: (table: string, data: any) => Promise<void>;
  seedData: () => Promise<void>;
}

const SupabaseContext = createContext<AppContextType | null>(null);

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabaseContext must be used within SupabaseProvider');
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    programs: [],
    activities: [],
    assessments: [],
    documentation: [],
    actions: [],
    feedback: [],
    classes: [],
    teachers: [],
  });
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const { data: testData, error: testError } = await supabase.from('programs').select('id').limit(1);
      
      if (testError && (testError.code === 'PGRST116' || testError?.code === '42P01')) {
         console.warn('Supabase tables not available, falling back to mock data.', testError);
         setUseFallback(true);
         setData(initialData as any);
         setLoading(false);
         return;
      }

      setUseFallback(false);

      const [
        { data: programs },
        { data: activities },
        { data: assessments },
        { data: documentation },
        { data: actions },
        { data: feedback },
        { data: classes },
        { data: teachers }
      ] = await Promise.all([
        supabase.from('programs').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('assessments').select('*'),
        supabase.from('documentation').select('*'),
        supabase.from('actions').select('*'),
        supabase.from('feedback').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('teachers').select('*')
      ]);

      setData({
        programs: programs || [],
        activities: activities || [],
        assessments: assessments || [],
        documentation: documentation || [],
        actions: actions || [],
        feedback: feedback || [],
        classes: classes || [],
        teachers: teachers || []
      });
    } catch (err) {
      console.error("Error fetching from Supabase:", err);
      setUseFallback(true);
      setData(initialData as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // If not logged in, we could fallback, but let's just clear data or fallback
      setUseFallback(true);
      setData(initialData as any);
      setLoading(false);
    }
  }, [user]);

  const updateItem = async (table: string, id: string, updates: any) => {
    if (useFallback) {
      setData(prev => ({
        ...prev,
        [table]: prev[table as keyof typeof prev].map((item: any) => item.id === id ? { ...item, ...updates } : item)
      }));
      return;
    }
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const insertItem = async (table: string, newItem: any) => {
     if (useFallback) {
       setData(prev => ({
         ...prev,
         [table]: [newItem, ...prev[table as keyof typeof prev]]
       }));
       return;
     }
     // Optional: assign explicit user_id if needed, though default auth.uid() in DB works better
     const { error } = await supabase.from(table).insert([newItem]);
     if (error) throw error;
     await refreshData();
  };

  const seedData = async () => {
    if (!user) {
      alert("You must be logged in to seed data.");
      return;
    }
    try {
       for (const item of initialData.programs) await supabase.from('programs').upsert(item);
       for (const item of initialData.activities) await supabase.from('activities').upsert(item);
       for (const item of initialData.assessments) await supabase.from('assessments').upsert(item);
       for (const item of initialData.documentation) await supabase.from('documentation').upsert(item);
       for (const item of initialData.actions) await supabase.from('actions').upsert(item);
       for (const item of initialData.feedback) await supabase.from('feedback').upsert(item);
       for (const item of initialData.classes) await supabase.from('classes').upsert(item);
       for (const item of initialData.teachers) await supabase.from('teachers').upsert(item);
       alert("Data seeded successfully!");
       refreshData();
    } catch (e: any) {
       alert("Error seeding data: " + e.message);
    }
  };

  return (
    <SupabaseContext.Provider value={{ user, ...data, loading, useFallback, refreshData, updateItem, insertItem, seedData }}>
      {children}
    </SupabaseContext.Provider>
  );
};
