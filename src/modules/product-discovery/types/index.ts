export interface ProductType {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide or custom svg indicator
}

export interface FeatureItem {
  id: string;
  label: string;
  description?: string;
}

export interface FeatureCategory {
  category: string;
  items: FeatureItem[];
}

export interface DiscoveryState {
  ideaText: string;
  selectedTypes: string[]; // ProductType ids
  selectedFeatures: string[]; // FeatureItem ids
  attachedFiles: File[];
  isSubmitting: boolean;
  draftSaved: boolean;
}
