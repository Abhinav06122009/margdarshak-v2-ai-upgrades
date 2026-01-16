import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Upload, Download, Share, Search, Filter, Heart, Eye, Shield, HardDrive,
  FileText, BookOpen, Code, DollarSign, AlertCircle, Star, Trash2, Edit,
  Users, Trophy, Target, Briefcase, Languages, Plus, MoreHorizontal, Folder
} from 'lucide-react';
import { X } from 'lucide-react'; // Make sure these icons are imported
import logo from "@/components/logo/logo.png";


interface ResourcesProps {
  onBack: () => void;
}

interface Resource {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  title?: string;
  description?: string;
  notes?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  language: string;
  grade_level?: string;
  subject?: string;
  difficulty_level: string;
  download_count: number;
  like_count: number;
  view_count: number;
  is_public: boolean;
  is_featured: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at?: string;
}

interface ResourceStats {
  total_resources: number;
  public_resources: number;
  private_resources: number;
  total_downloads: number;
  total_likes: number;
  total_storage_used: number;
  categories: string[];
  languages: string[];
  popular_tags: string[];
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    role: string;
    student_id?: string;
    preferred_language?: string;
  };
}

interface CategorySummary {
  name: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
}

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.string().min(1, 'Language is required'),
  grade_level: z.string().optional(),
  subject: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.string().optional(),
  is_public: z.boolean().default(true),
});

const STORAGE_LIMITS: { [key: string]: number } = {
  'student': 1 * 1024 * 1024 * 1024,      // 1 GB
  'premium': 50 * 1024 * 1024 * 1024,     // 50 GB
  'bdo': 50 * 1024 * 1024 * 1024,         // 50 GB
  'admin': 50 * 1024 * 1024 * 1024,       // 50 GB
  'superadmin': 50 * 1024 * 1024 * 1024,  // 50 GB
  'extra++': 500 * 1024 * 1024 * 1024,   // 500 GB
  'default': 1 * 1024 * 1024 * 1024,      // 1 GB
};

type ResourceFormData = z.infer<typeof resourceSchema>;

// Default category suggestions with icons
const defaultCategoryIcons: { [key: string]: { icon: React.ComponentType<any>, color: string } } = {
  'worksheets': { icon: FileText, color: '#3B82F6' },
  'lesson-plans': { icon: BookOpen, color: '#10B981' },
  'coding': { icon: Code, color: '#8B5CF6' },
  'financial-literacy': { icon: DollarSign, color: '#F59E0B' },
  'interview-prep': { icon: Users, color: '#EF4444' },
  'resume-building': { icon: Briefcase, color: '#06B6D4' },
  'project-challenges': { icon: Target, color: '#84CC16' },
  'career-pathways': { icon: Trophy, color: '#F97316' },
  'presentations': { icon: BookOpen, color: '#EC4899' },
  'documents': { icon: FileText, color: '#6366F1' },
  'templates': { icon: Star, color: '#F59E0B' },
  'study-materials': { icon: BookOpen, color: '#10B981' },
  'assignments': { icon: Edit, color: '#EF4444' },
  'reference': { icon: BookOpen, color: '#8B5CF6' },
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
];

// Enhanced helper functions for Resources
const resourceHelpers = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile ? {
          full_name: profile.full_name || 'User',
          role: profile.role || 'student',
          student_id: profile.student_id,
          preferred_language: profile.preferred_language || 'en'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserResources: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user resources:', error);
      return [];
    }
  },

  getResourceStatistics: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_resource_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching resource statistics:', error);
      return null;
    }
  },

  // NEW: Get unique categories from user's resources
  getUserCategories: async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('category')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.category).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching user categories:', error);
      return [];
    }
  },

  searchResources: async (query: string, category?: string, language?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_resources', {
          p_query: query || null,
          p_category: category || null,
          p_language: language || null,
          p_limit: 50
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching resources:', error);
      return [];
    }
  },

  uploadFile: async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('school-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-files')
        .getPublicUrl(fileName);

      return {
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  createResource: async (resourceData: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resourceData,
          user_id: userId,
          tags: resourceData.tags ? resourceData.tags.split(',').map((tag: string) => tag.trim()) : []
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  updateResource: async (resourceId: string, resourceData: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          ...resourceData,
          tags: resourceData.tags ? resourceData.tags.split(',').map((tag: string) => tag.trim()) : []
        })
        .eq('id', resourceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  deleteResource: async (resourceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', resourceId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  trackDownload: async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('track_resource_download', {
          p_resource_id: resourceId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking download:', error);
      throw error;
    }
  },

  toggleLike: async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('toggle_resource_like', {
          p_resource_id: resourceId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};

import SupabaseStatus from '@/components/SupabaseStatus';

const Resources: React.FC<ResourcesProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  const [storageLimit, setStorageLimit] = useState(STORAGE_LIMITS['default']);
  // NEW: State for dynamic categories and suggestions
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { toast } = useToast();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      language: 'en',
      grade_level: '',
      subject: '',
      difficulty_level: 'beginner',
      tags: '',
      is_public: true,
    },
  });

  useEffect(() => {
    initializeSecureResources();
  }, []);

  const initializeSecureResources = async () => {
    try {
      setLoading(true);
      
      const user = await resourceHelpers.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your resources.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);

      const userRole = user.profile?.role || 'student';
      const limit = STORAGE_LIMITS[userRole] || STORAGE_LIMITS['default'];
      setStorageLimit(limit);
      
      // Set default language from user preference
      if (user.profile?.preferred_language) {
        setSelectedLanguage(user.profile.preferred_language);
        form.setValue('language', user.profile.preferred_language);
      }
      
      // Fetch user's resources, statistics, and categories
      const [userResources, stats, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(user.id),
        resourceHelpers.getResourceStatistics(),
        resourceHelpers.getUserCategories(user.id)
      ]);
      
      setResources(userResources);
      setResourceStats(stats);
      setUserCategories(categories);
      
      // Set default category suggestions
      setCategorySuggestions([
        ...categories, // User's existing categories
        ...Object.keys(defaultCategoryIcons) // Default suggestions
      ]);

toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Secure Access Verified
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      Welcome {user.profile?.full_name || 'User'}! Your resources are private and secure.
    </span>
  ),
  icon: <Shield className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});


    } catch (error) {
      console.error('Error initializing secure resources:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize secure resources system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic category summaries
  const getCategorySummaries = (): CategorySummary[] => {
    const categoryMap = new Map<string, number>();
    
    resources.forEach(resource => {
      const count = categoryMap.get(resource.category) || 0;
      categoryMap.set(resource.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => {
      const defaultIcon = defaultCategoryIcons[name.toLowerCase().replace(/\s+/g, '-')];
      return {
        name,
        count,
        icon: defaultIcon?.icon || Folder,
        color: defaultIcon?.color || '#6B7280'
      };
    }).sort((a, b) => b.count - a.count);
  };

  // Custom input component with category suggestions
  const CategoryInputWithSuggestions: React.FC<{
    field: any;
    placeholder: string;
  }> = ({ field, placeholder }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleInputChange = (value: string) => {
      field.onChange(value);
      if (value.trim()) {
        const filtered = categorySuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions([...new Set(filtered)]);
        setShowCategorySuggestions(filtered.length > 0);
      } else {
        setShowCategorySuggestions(false);
      }
    };

    const selectSuggestion = (suggestion: string) => {
      field.onChange(suggestion);
      setShowCategorySuggestions(false);
    };

    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={field.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (categorySuggestions.length > 0) {
              setFilteredSuggestions(categorySuggestions.slice(0, 10));
              setShowCategorySuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
        />
        {showCategorySuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-2"
                onClick={() => selectSuggestion(suggestion)}
              >
                {defaultCategoryIcons[suggestion.toLowerCase().replace(/\s+/g, '-')] ? (
                  React.createElement(
                    defaultCategoryIcons[suggestion.toLowerCase().replace(/\s+/g, '-')].icon,
                    { className: "w-4 h-4" }
                  )
                ) : (
                  <Folder className="w-4 h-4" />
                )}
                <span>{suggestion}</span>
                {userCategories.includes(suggestion) && (
                  <Badge variant="outline" className="ml-auto text-xs">Your Category</Badge>
                )}
              </div>
            ))}
            <div className="px-3 py-2 text-xs text-gray-500 border-t">
              💡 Type to create new category or select from suggestions
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await resourceHelpers.uploadFile(file, currentUser.id);
  };

  const onSubmit = async (data: ResourceFormData) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload resources.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      let fileData = {};
      
      if (!editingResource) {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) {
 toast({
  title: (
    <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
      File Required
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      Please select a file to upload.
    </span>
  ),
  icon: <AlertCircle className="text-red-500" />,
  className: "relative bg-black border border-red-500/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full
        text-red-500 hover:text-red-300
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

          return;
        }

        // Check storage limit before uploading
        const currentUsage = resourceStats?.total_storage_used || 0;
        if (currentUsage + file.size > storageLimit) {
          toast({
            title: 'Storage Limit Exceeded',
            description: `You cannot upload this file. Your storage is full. Used ${formatFileSize(currentUsage)} of ${formatFileSize(storageLimit)}.`,
            variant: 'destructive',
          });
          return;
        }

        fileData = await handleFileUpload(file);
      }

      const resourceData = {
        title: data.title,
        description: data.description,
        category: data.category.trim(), // Ensure category is trimmed
        language: data.language,
        grade_level: data.grade_level,
        subject: data.subject,
        difficulty_level: data.difficulty_level,
        tags: data.tags,
        is_public: data.is_public,
        file_name: editingResource?.file_name || (document.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0]?.name,
        ...fileData,
      };

      if (editingResource) {
        await resourceHelpers.updateResource(editingResource.id, resourceData, currentUser.id);
toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Resource Updated Successfully!
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{data.title}</em>&quot; has been updated in your secure resource library.
    </span>
  ),
  icon: <Edit className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      } else {
        await resourceHelpers.createResource(resourceData, currentUser.id);
toast({
  title: (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
      Resource Uploaded Successfully!
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{data.title}</em>&quot; has been added to your private resource collection.
    </span>
  ),
  icon: <Plus className="text-emerald-400" />,
  className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      }

      setIsDialogOpen(false);
      setEditingResource(null);
      form.reset();
      
      // Refresh resources and categories
      const [userResources, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(currentUser.id),
        resourceHelpers.getUserCategories(currentUser.id)
      ]);
      
      setResources(userResources);
      setUserCategories(categories);
      
      // Update category suggestions
      setCategorySuggestions([
        ...categories,
        ...Object.keys(defaultCategoryIcons)
      ]);
      
    } catch (error: any) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error Saving Resource',
        description: `Failed to save resource: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    form.setValue('title', resource.title || resource.file_name);
    form.setValue('description', resource.description || '');
    form.setValue('category', resource.category);
    form.setValue('language', resource.language);
    form.setValue('grade_level', resource.grade_level || '');
    form.setValue('subject', resource.subject || '');
    form.setValue('difficulty_level', resource.difficulty_level);
    form.setValue('tags', resource.tags?.join(', ') || '');
    form.setValue('is_public', resource.is_public);
    setIsDialogOpen(true);
  };

  const handleDelete = async (resourceId: string, resourceTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) return;
    if (!currentUser) return;

    try {
      await resourceHelpers.deleteResource(resourceId, currentUser.id);    
 
toast({
  title: (
    <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
      Resource Deleted Successfully
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      &quot;<em>{resourceTitle}</em>&quot; has been moved to trash.
    </span>
  ),
  icon: <Trash2 className="text-red-500" />,
  className: "relative bg-black border border-red-500/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-red-500 hover:text-red-300 
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      
      // Refresh resources and categories
      const [userResources, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(currentUser.id),
        resourceHelpers.getUserCategories(currentUser.id)
      ]);
      
      setResources(userResources);
      setUserCategories(categories);
      
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error Deleting Resource",
        description: `Failed to delete resource: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Track download
      await resourceHelpers.trackDownload(resource.id);
      
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

toast({
  title: (
    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent font-bold">
      Download Started
    </span>
  ),
  description: (
    <span className="text-white font-medium">
      Your file download has started
    </span>
  ),
  icon: <Download className="text-blue-400" />,
  className: "relative bg-black border border-blue-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
  action: (
    <button
      onClick={() => toast.dismiss()}
      aria-label="Close"
      className="
        absolute top-2 right-2 p-1 rounded-full 
        text-blue-400 hover:text-blue-200 
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
    >
      <X className="w-5 h-5" />
    </button>
  ),
});

      
      // Refresh resources to update download count
      if (currentUser) {
        const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
        setResources(userResources);
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast({
        title: "Error",
        description: "Failed to download resource",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (resource: Resource) => {
    const shareUrl = resource.file_url;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title || resource.file_name,
          text: resource.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Resource link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      toast({
        title: "Error",
        description: "Failed to share resource",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (resourceId: string) => {
    if (!currentUser) return;

    try {
      await resourceHelpers.toggleLike(resourceId);
      
      // Refresh resources to update like count
      const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
      setResources(userResources);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
        const results = await resourceHelpers.searchResources(
          searchTerm,
          selectedCategory !== 'all' ? selectedCategory : undefined,
          selectedLanguage !== 'all' ? selectedLanguage : undefined
        );
        setResources(results);
      } else {
        // Reset to user's resources
        const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
        setResources(userResources);
      }
    } catch (error) {
      console.error('Error searching resources:', error);
    }
  };

  const getFilteredResources = (category: string = 'all') => {
    return resources.filter(resource => {
      const matchesSearch = !searchTerm || 
        resource.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === 'all' || resource.category === category;
      const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage;
      
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    form.reset();
    setEditingResource(null);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure resources system...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Maximum Security Active</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please log in to access your private resources system.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <Shield className="w-4 h-4" />
              <span>Your resources are completely private and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categorySummaries = getCategorySummaries();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onBack}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                📚 My Learning Resources
                <Shield className="w-8 h-8 text-green-400" />
              </h1>
              <p className="text-white/80">
                Private workspace for {currentUser.profile?.full_name} - Your resources are completely secure
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                  <Eye className="w-3 h-3 text-green-400" />
                  <span className="text-green-300 text-xs">Private Collection</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-300 text-xs">{resources.length} Resources</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-400/30">
                  <Folder className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs">{categorySummaries.length} Categories</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-black hover:from-purple-600 hover:to-pink-600"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    {editingResource ? 'Edit Resource' : 'Upload New Resource'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingResource ? 'Update your resource information' : 'Share educational resources with the community. Create custom categories by typing them.'}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {!editingResource && (
                      <div>
                        <label className="block text-sm font-medium mb-2">File *</label>
                        <input 
                          type="file" 
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3,.txt,.zip"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Supported formats: PDF, DOC, PPT, XLS, Images, Videos, Audio, Text files (Max: 50MB)
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resource Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter resource title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <FormControl>
                              <CategoryInputWithSuggestions
                                field={field}
                                placeholder="Type to create or select category..."
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500 mt-1">
                              Create your own category or select from suggestions
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your resource..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="difficulty_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade Level</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 10, College" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mathematics, Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter tags separated by commas..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>


                    {/* Show current categories for reference */}
                    {userCategories.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-2">Your existing categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {userCategories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={uploading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {uploading ? 'Processing...' : (editingResource ? 'Update Resource' : 'Upload Resource')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {resourceStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{resourceStats.total_resources}</span>
              </div>
              <h3 className="text-white font-semibold">Total Resources</h3>
              <p className="text-white/60 text-sm">In your collection</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Download className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{resourceStats.total_downloads}</span>
              </div>
              <h3 className="text-white font-semibold">Downloads</h3>
              <p className="text-white/60 text-sm">Total downloads</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-red-400" />
                <span className="text-2xl font-bold text-white">{resourceStats.total_likes}</span>
              </div>
              <h3 className="text-white font-semibold">Likes</h3>
              <p className="text-white/60 text-sm">Community favorites</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Upload className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">{formatFileSize(resourceStats.total_storage_used)}</span>
              </div>
              <h3 className="text-white font-semibold">Storage Used</h3>
              <p className="text-white/60 text-sm">Total file size</p>
            </div>

            <div className="glass-morphism p-6 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-8 h-8 text-cyan-400" />
                <span className="text-lg font-bold text-white">{((resourceStats.total_storage_used / storageLimit) * 100).toFixed(1)}%</span>
              </div>
              <h3 className="text-white font-semibold">Storage Quota</h3>
              <div className="w-full bg-white/10 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${(resourceStats.total_storage_used / storageLimit) * 100}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-xs mt-1 text-right">
                {formatFileSize(resourceStats.total_storage_used)} / {formatFileSize(storageLimit)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {userCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>

          <div className="flex items-center justify-center text-white/80">
            <Filter className="h-4 w-4 mr-2" />
            {getFilteredResources().length} Resources
          </div>
        </motion.div>

        {/* Dynamic Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-auto bg-white/10 p-1 rounded-xl">
              <TabsTrigger 
                value="all" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                All Resources ({resources.length})
              </TabsTrigger>
              {categorySummaries.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={category.name}
                    value={category.name} 
                    className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name} ({category.count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <ResourceGrid resources={getFilteredResources('all')} />
            </TabsContent>

            {categorySummaries.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-6">
                <ResourceGrid resources={getFilteredResources(category.name)} />
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Enhanced Security Footer */}

        {/* Footer */}
  <footer className="mt-12 py-6 border-t border-white/20 text-sm select-none flex items-center justify-center gap-4 text-white/70">
  <img
    src={logo}
    alt="MARGDARSHAK Logo"
    className="w-15 h-14 object-contain mr-4 bg-white"
    draggable={false}
    style={{ minWidth: 48 }}
  />
  <div className="text-center">
    Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span>
    <br />
    Developed &amp; Maintained by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span>
    <br />
    © 2025 VSAV GYANTAPA. All Rights Reserved
  </div>
</footer>
      </div>
    </div>
  );

  // Resource Grid Component
  function ResourceGrid({ resources: filteredResources }: { resources: Resource[] }) {
    if (filteredResources.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="glass-morphism rounded-2xl p-8 border border-white/20">
            <FileText className="w-16 h-16 mx-auto text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
            <p className="text-white/60 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Start by uploading your first resource'
              }
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Resource
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredResources.map((resource, index) => {
            const defaultIcon = defaultCategoryIcons[resource.category.toLowerCase().replace(/\s+/g, '-')];
            const Icon = defaultIcon?.icon || Folder;
            const language = languages.find(l => l.code === resource.language);

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-morphism border-white/20 hover:bg-white/10 transition-all h-full group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-5 w-5 text-white flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-white text-lg truncate">
                            {resource.title || resource.file_name}
                          </CardTitle>
                          <p className="text-white/60 text-sm">{resource.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id, resource.title || resource.file_name)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm line-clamp-3">
                      {resource.description || resource.notes || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-white border-white/20">
                        {resource.file_type}
                      </Badge>
                      <Badge variant="outline" className="text-white/60 border-white/20 text-xs">
                        {formatFileSize(resource.file_size)}
                      </Badge>
                      {language && (
                        <Badge variant="outline" className="text-white/60 border-white/20 text-xs">
                          {language.flag} {language.name}
                        </Badge>
                      )}
                      {resource.difficulty_level && (
                        <Badge variant="outline" className="text-white/60 border-white/20 text-xs capitalize">
                          {resource.difficulty_level}
                        </Badge>
                      )}
                      {!resource.is_public && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/20 text-xs">
                          Private
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-white/60 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {resource.download_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {resource.like_count}
                        </span>
                      </div>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                            +{resource.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(resource)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShare(resource)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLike(resource.id)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
};

export default Resources;
