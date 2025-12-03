import type { Facility, Campus, FacilityType } from '../../../../types';
import { mockFacilities } from '../../../../data/adminMockData';

export const facilityApi = {
  // Get all facilities
  getFacilities: async (filters?: {
    campus?: Campus;
    type?: FacilityType;
    isActive?: boolean;
  }): Promise<Facility[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockFacilities];
        
        if (filters?.campus) {
          filtered = filtered.filter(f => f.campus === filters.campus);
        }
        
        if (filters?.type) {
          filtered = filtered.filter(f => f.type === filters.type);
        }
        
        if (filters?.isActive !== undefined) {
          filtered = filtered.filter(f => f.isActive === filters.isActive);
        }
        
        resolve(filtered);
      }, 300);
    });
  },

  // Get facility by ID
  getFacilityById: async (id: string): Promise<Facility | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const facility = mockFacilities.find(f => f.id === id);
        resolve(facility || null);
      }, 300);
    });
  },

  // Create new facility
  createFacility: async (facility: Omit<Facility, 'id'>): Promise<Facility> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFacility: Facility = {
          ...facility,
          id: `f${Date.now()}`,
        };
        mockFacilities.push(newFacility);
        resolve(newFacility);
      }, 300);
    });
  },

  // Update facility
  updateFacility: async (id: string, updates: Partial<Facility>): Promise<Facility> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockFacilities.findIndex(f => f.id === id);
        if (index !== -1) {
          mockFacilities[index] = { ...mockFacilities[index], ...updates };
          resolve(mockFacilities[index]);
        } else {
          reject(new Error('Facility not found'));
        }
      }, 300);
    });
  },

  // Delete facility
  deleteFacility: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockFacilities.findIndex(f => f.id === id);
        if (index !== -1) {
          mockFacilities.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Facility not found'));
        }
      }, 300);
    });
  },

  // Toggle facility status
  toggleFacilityStatus: async (id: string): Promise<Facility> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const facility = mockFacilities.find(f => f.id === id);
        if (facility) {
          facility.isActive = !facility.isActive;
          resolve(facility);
        } else {
          reject(new Error('Facility not found'));
        }
      }, 300);
    });
  }
};

