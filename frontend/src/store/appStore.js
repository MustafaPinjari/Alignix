import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  // Document understanding
  understanding: null,
  setUnderstanding: (u) => set({ understanding: u }),

  // Sandbox / preview state
  sandboxPreview: null,
  setSandboxPreview: (p) => set({ sandboxPreview: p }),
  sandboxScope: null,
  setSandboxScope: (s) => set({ sandboxScope: s }),
  clarificationAnswers: {},
  setClarificationAnswer: (id, val) =>
    set((s) => ({ clarificationAnswers: { ...s.clarificationAnswers, [id]: val } })),
  clearClarifications: () => set({ clarificationAnswers: {} }),

  // Review workflow step
  reviewStep: "idle", // idle | analyzing | clarifying | previewing | committing
  setReviewStep: (step) => set({ reviewStep: step }),

  // Active document
  activeDocument: null,
  setActiveDocument: (doc) => set({ activeDocument: doc }),

  // Analysis result
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),

  // Structure analysis
  structureResult: null,
  setStructureResult: (r) => set({ structureResult: r }),

  // Overlay violations
  overlayData: [],
  setOverlayData: (d) => set({ overlayData: d }),

  // Health scores
  healthScore: null,
  setHealthScore: (score) => set({ healthScore: score }),

  // Profiles
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),

  // Active profile
  activeProfileId: null,
  setActiveProfileId: (id) => set({ activeProfileId: id }),

  // Integrity Lock
  integrityLocked: false,
  setIntegrityLocked: (v) => set({ integrityLocked: v }),

  // Monitor state
  isMonitoring: false,
  setMonitoring: (v) => set({ isMonitoring: v }),
  monitorEvents: [],
  addMonitorEvent: (event) =>
    set((s) => ({ monitorEvents: [event, ...s.monitorEvents].slice(0, 200) })),

  // Batch state
  batchRunning: false,
  setBatchRunning: (v) => set({ batchRunning: v }),
  batchProgress: null,
  setBatchProgress: (p) => set({ batchProgress: p }),
  batchResults: [],
  setBatchResults: (r) => set({ batchResults: r }),

  // Correction history
  correctionHistory: [],
  setCorrectionHistory: (h) => set({ correctionHistory: h }),

  // Word COM open docs
  wordDocuments: [],
  setWordDocuments: (d) => set({ wordDocuments: d }),

  // Loading states
  loading: {},
  setLoading: (key, val) => set((s) => ({ loading: { ...s.loading, [key]: val } })),

  // Notifications
  notifications: [],
  notify: (msg, type = "info") =>
    set((s) => ({
      notifications: [{ id: Date.now(), msg, type }, ...s.notifications].slice(0, 8),
    })),
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
