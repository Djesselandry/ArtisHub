export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  role: string;
  bio?: string;
  handle: string;
  followersCount?: number;
  likesCount?: number;
  isCustomAccount?: boolean;
}

export type ProjectCategory = 'Digital Art' | '3D Modeling' | 'BD & Manga' | 'Storyboards' | 'Concept Art' | 'Illustration';
export type ProjectStatus = 'En recherche de collaborateurs' | 'En cours' | 'Terminé';

export interface ProjectComment {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  author: string;
  authorUid?: string;
  authorHandle?: string;
  authorAvatar: string;
  authorRole: string;
  imageUrl: string;
  additionalImages?: string[];
  category: ProjectCategory;
  tags: string[];
  likes: number;
  likedBy: string[]; // uids or ips
  commentsCount: number;
  comments?: ProjectComment[];
  status: ProjectStatus;
  createdAt: string;
  views?: number;
  featured?: boolean;
}

export type RoleNeeded = 'Illustrator' | 'Writer / Scénariste' | 'Colorist' | '3D Modeler' | 'Storyboarder' | 'Sound Designer';
export type ProjectType = 'Comic / Manga' | 'Video Game' | 'Animation' | 'Commission' | 'Other';
export type AdStatus = 'HIRING' | 'AVAILABLE';

export interface CollaborationApplication {
  id: string;
  adId: string;
  applicantName: string;
  applicantHandle: string;
  applicantEmail: string;
  applicantAvatar: string;
  portfolioUrl?: string;
  message: string;
  createdAt: string;
}

export interface CollaborationAd {
  id: string;
  title: string;
  author: string;
  authorUid?: string;
  authorHandle: string;
  authorAvatar: string;
  roleNeeded: RoleNeeded;
  projectType: ProjectType;
  status: AdStatus;
  description: string;
  tags: string[];
  postedAgo: string;
  createdAt: string;
  compensation?: string;
  applications?: CollaborationApplication[];
  contactEmail?: string;
}

export type ForumCategory = 'tips' | 'critiques' | 'news' | 'general';

export interface ForumReply {
  id: string;
  author: string;
  authorUid?: string;
  authorHandle?: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  authorUid?: string;
  authorHandle?: string;
  authorAvatar: string;
  category: ForumCategory;
  categoryLabel?: string;
  subCategoryTag?: string;
  tags: string[];
  repliesCount: number;
  viewsCount: number;
  lastActivity: string;
  lastActivityUser?: string;
  createdAt: string;
  previewText: string;
  content: string;
  imagePreview?: string;
  pinned?: boolean;
  isNew?: boolean;
  replies: ForumReply[];
  likes?: number;
  likedBy?: string[];
}
