import type { Facility, Campus, FacilityType } from '../../../../types';
import { mockFacilities } from '../../../../data/adminMockData';

export interface FacilityFilters {
  campus?: Campus;
  type?: FacilityType;
  searchQuery?: string;
}

export const userFacilityApi = {
  // Get all available facilities for booking (only active ones)
  getAvailableFacilities: async (filters?: FacilityFilters): Promise<Facility[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = mockFacilities.filter(f => f.isActive);
        
        if (filters?.campus) {
          filtered = filtered.filter(f => f.campus === filters.campus);
        }
        
        if (filters?.type) {
          filtered = filtered.filter(f => f.type === filters.type);
        }
        
        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(f => 
            f.name.toLowerCase().includes(query) ||
            f.location.toLowerCase().includes(query) ||
            f.description?.toLowerCase().includes(query)
          );
        }
        
        resolve(filtered);
      }, 300);
    });
  },

  // Get facility by ID
  getFacilityById: async (id: string): Promise<Facility | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const facility = mockFacilities.find(f => f.id === id && f.isActive);
        resolve(facility || null);
      }, 300);
    });
  },

  // Get facilities count by campus
  getFacilitiesCountByCampus: async (): Promise<{ HCM: number; NVH: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeFacilities = mockFacilities.filter(f => f.isActive);
        resolve({
          HCM: activeFacilities.filter(f => f.campus === 'HCM').length,
          NVH: activeFacilities.filter(f => f.campus === 'NVH').length,
        });
      }, 200);
    });
  }
};


