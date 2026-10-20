import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Dataset, DatasetKPIs, FilterState, SavedAnalysis, SavedProject } from '../types';
import { buildSampleDataset } from '../lib/dataParser';
import { calculateCategoryBreakdown, calculateCityBreakdown, calculateKPIs, calculateTimeSeries, filterRows, ColumnMapping } from '../lib/analytics';
import { detectAnomalies } from '../lib/anomalyDetection';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const initialFilters: FilterState = {
  dateRange: { start: '', end: '' },
  categories: [],
  cities: [],
  orderStatuses: [],
  searchQuery: '',
};

interface DataContextType {
  dataset: Dataset;
  setDataset: (dataset: Dataset) => void;
  resetToSample: () => void;
  filters: FilterState;
  updateFilters: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  filteredRows: Record<string, any>[];
  filteredKpis: DatasetKPIs;
  savedProjects: SavedProject[];
  savedAnalyses: SavedAnalysis[];
  isSaving: boolean;
  saveCurrentProject: (title: string, description?: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveAnalysis: (analysis: Omit<SavedAnalysis, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteAnalysis: (analysisId: string) => Promise<void>;
  loadSavedProjects: () => Promise<void>;
  applyColumnMapping: (mapping: ColumnMapping) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  const [dataset, setDataset] = useState<Dataset>(() => buildSampleDataset());
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const stored = localStorage.getItem('datapilot_saved_projects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem('datapilot_saved_analyses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const resetToSample = () => {
    setDataset(buildSampleDataset());
    setFilters(initialFilters);
  };

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const applyColumnMapping = (mapping: ColumnMapping) => {
    const kpis = calculateKPIs(dataset.rows, mapping);
    const categoryBreakdown = calculateCategoryBreakdown(dataset.rows, mapping);
    const cityBreakdown = calculateCityBreakdown(dataset.rows, mapping);
    const timeSeries = calculateTimeSeries(dataset.rows, mapping);
    setDataset((prev) => ({
      ...prev,
      columnMapping: mapping,
      kpis,
      categoryBreakdown,
      cityBreakdown,
      timeSeries,
    }));
  };

  const filteredRows = useMemo(() => {
    return filterRows(dataset.rows, filters, dataset.columnMapping);
  }, [dataset.rows, filters, dataset.columnMapping]);

  const filteredKpis = useMemo(() => {
    return calculateKPIs(filteredRows, dataset.columnMapping);
  }, [filteredRows, dataset.columnMapping]);

  // Load saved projects & analyses from Firestore when user changes
  const loadSavedProjects = async () => {
    if (!currentUser) return;
    const projectsPath = `users/${currentUser.uid}/projects`;
    try {
      const snap = await getDocs(collection(db, 'users', currentUser.uid, 'projects'));
      const projs: SavedProject[] = [];
      snap.forEach((docSnap) => {
        projs.push(docSnap.data() as SavedProject);
      });
      setSavedProjects(projs);
    } catch (err) {
      console.warn('Firestore projects fetch notice:', err);
    }

    const analysesPath = `users/${currentUser.uid}/analyses`;
    try {
      const snap = await getDocs(collection(db, 'users', currentUser.uid, 'analyses'));
      const items: SavedAnalysis[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as SavedAnalysis);
      });
      setSavedAnalyses(items);
    } catch (err) {
      console.warn('Firestore analyses fetch notice:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadSavedProjects();
    } else if (isGuest) {
      try {
        const pStored = localStorage.getItem('datapilot_saved_projects');
        if (pStored) setSavedProjects(JSON.parse(pStored));
        const aStored = localStorage.getItem('datapilot_saved_analyses');
        if (aStored) setSavedAnalyses(JSON.parse(aStored));
      } catch (err) {
        console.warn('Local storage load notice:', err);
      }
    }
  }, [currentUser, isGuest]);

  const saveCurrentProject = async (title: string, description = '') => {
    const projectId = `proj_${Date.now()}`;
    const newProject: SavedProject = {
      id: projectId,
      userId: currentUser?.uid || 'guest',
      title,
      description,
      datasetName: dataset.fileName,
      rowCount: dataset.rows.length,
      columnCount: dataset.columns.length,
      metricsSummary: JSON.stringify({
        totalRevenue: dataset.kpis.totalRevenue,
        totalOrders: dataset.kpis.totalOrders,
        aov: dataset.kpis.averageOrderValue,
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isGuest || !currentUser) {
      setSavedProjects((prev) => {
        const next = [newProject, ...prev];
        localStorage.setItem('datapilot_saved_projects', JSON.stringify(next));
        return next;
      });
      return;
    }

    setIsSaving(true);
    const path = `users/${currentUser.uid}/projects/${projectId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), {
        ...newProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSavedProjects((prev) => [newProject, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (isGuest || !currentUser) {
      setSavedProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        localStorage.setItem('datapilot_saved_projects', JSON.stringify(next));
        return next;
      });
      return;
    }

    const path = `users/${currentUser.uid}/projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'projects', projectId));
      setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const saveAnalysis = async (analysisData: Omit<SavedAnalysis, 'id' | 'userId' | 'createdAt'>) => {
    const analysisId = `an_${Date.now()}`;
    const newAnalysis: SavedAnalysis = {
      ...analysisData,
      id: analysisId,
      userId: currentUser?.uid || 'guest',
      createdAt: new Date().toISOString(),
    };

    if (isGuest || !currentUser) {
      setSavedAnalyses((prev) => {
        const next = [newAnalysis, ...prev];
        localStorage.setItem('datapilot_saved_analyses', JSON.stringify(next));
        return next;
      });
      return;
    }

    setIsSaving(true);
    const path = `users/${currentUser.uid}/analyses/${analysisId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'analyses', analysisId), {
        ...newAnalysis,
        createdAt: serverTimestamp(),
      });
      setSavedAnalyses((prev) => [newAnalysis, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (isGuest || !currentUser) {
      setSavedAnalyses((prev) => {
        const next = prev.filter((a) => a.id !== analysisId);
        localStorage.setItem('datapilot_saved_analyses', JSON.stringify(next));
        return next;
      });
      return;
    }

    const path = `users/${currentUser.uid}/analyses/${analysisId}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'analyses', analysisId));
      setSavedAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <DataContext.Provider
      value={{
        dataset,
        setDataset,
        resetToSample,
        filters,
        updateFilters,
        resetFilters,
        filteredRows,
        filteredKpis,
        savedProjects,
        savedAnalyses,
        isSaving,
        saveCurrentProject,
        deleteProject,
        saveAnalysis,
        deleteAnalysis,
        loadSavedProjects,
        applyColumnMapping,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
