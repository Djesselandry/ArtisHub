import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { Project, CollaborationAd, ForumTopic, UserProfile, ProjectComment, ForumReply, CollaborationApplication } from '../types';
import { INITIAL_PROJECTS, INITIAL_COLLABORATIONS, INITIAL_FORUM_TOPICS, DEMO_USERS } from './initialData';

// Check if Firebase config is supplied via env or custom storage
const getFirebaseConfig = () => {
  const savedConfig = localStorage.getItem('artishub_custom_firebase_config');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch {
      // ignore
    }
  }

  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length > 5) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
  }
  return null;
};

const firebaseConfig = getFirebaseConfig();
let isFirebaseLive = false;
let authInstance: any = null;
let dbInstance: any = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    isFirebaseLive = true;
    console.log('🔥 ArtisHub: Firebase initialized with live backend!');
  } catch (err) {
    console.warn('⚠️ ArtisHub: Firebase config found but init failed, falling back to local store:', err);
    isFirebaseLive = false;
  }
}

// ----------------------------------------------------
// LOCAL REACTIVE STORE ENGINE (LocalStorage Fallback)
// ----------------------------------------------------
const STORAGE_KEYS = {
  PROJECTS: 'artishub_projects_v2',
  COLLABS: 'artishub_collaborations_v2',
  FORUM: 'artishub_forum_topics_v2',
  CURRENT_USER: 'artishub_current_user_v2',
  CUSTOM_USERS: 'artishub_custom_users_v2',
};

// Initialize default storage data
const loadInitial = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
};

let localProjects: Project[] = loadInitial(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
let localCollaborations: CollaborationAd[] = loadInitial(STORAGE_KEYS.COLLABS, INITIAL_COLLABORATIONS);
let localForumTopics: ForumTopic[] = loadInitial(STORAGE_KEYS.FORUM, INITIAL_FORUM_TOPICS);
let localCurrentUser: UserProfile | null = loadInitial(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
let customUsers: UserProfile[] = loadInitial(STORAGE_KEYS.CUSTOM_USERS, []);

type Listener<T> = (data: T) => void;
const projectListeners = new Set<Listener<Project[]>>();
const collabListeners = new Set<Listener<CollaborationAd[]>>();
const forumListeners = new Set<Listener<ForumTopic[]>>();
const authListeners = new Set<Listener<UserProfile | null>>();

const getLiveUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile | null> => {
  if (!isFirebaseLive || !dbInstance) return null;

  try {
    const userSnapshot = await getDoc(doc(dbInstance, 'users', fbUser.uid));
    if (!userSnapshot.exists()) return null;
    return { uid: fbUser.uid, ...(userSnapshot.data() as Omit<UserProfile, 'uid'>) };
  } catch (err) {
    console.warn('Could not load user profile from Firestore:', err);
    return null;
  }
};

const saveLiveUserProfile = async (profile: UserProfile) => {
  if (!isFirebaseLive || !dbInstance) return;

  try {
    await setDoc(doc(dbInstance, 'users', profile.uid), profile);
  } catch (err) {
    // Authentication remains usable if Firestore rules have not yet been configured.
    console.warn('Could not save user profile to Firestore:', err);
  }
};

const notifyProjects = () => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(localProjects));
  projectListeners.forEach((l) => l([...localProjects]));
};

const notifyCollabs = () => {
  localStorage.setItem(STORAGE_KEYS.COLLABS, JSON.stringify(localCollaborations));
  collabListeners.forEach((l) => l([...localCollaborations]));
};

const notifyForum = () => {
  localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(localForumTopics));
  forumListeners.forEach((l) => l([...localForumTopics]));
};

const notifyAuth = () => {
  if (localCurrentUser) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(localCurrentUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  authListeners.forEach((l) => l(localCurrentUser ? { ...localCurrentUser } : null));
};

// ----------------------------------------------------
// PUBLIC API (Seamless Firebase + Local Fallback)
// ----------------------------------------------------

export const getFirebaseStatus = () => {
  return {
    isLive: isFirebaseLive,
    projectId: firebaseConfig?.projectId || 'local-demo-store',
  };
};

export const saveCustomFirebaseConfig = (config: Record<string, string>) => {
  localStorage.setItem('artishub_custom_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const resetLocalDatabase = () => {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.COLLABS);
  localStorage.removeItem(STORAGE_KEYS.FORUM);
  localProjects = [...INITIAL_PROJECTS];
  localCollaborations = [...INITIAL_COLLABORATIONS];
  localForumTopics = [...INITIAL_FORUM_TOPICS];
  notifyProjects();
  notifyCollabs();
  notifyForum();
};

// AUTHENTICATION
export const subscribeToAuth = (callback: (user: UserProfile | null) => void) => {
  authListeners.add(callback);
  callback(localCurrentUser);

  if (isFirebaseLive && authInstance) {
    const unsubscribe = onAuthStateChanged(authInstance, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const savedProfile = await getLiveUserProfile(fbUser);
        const found = savedProfile || DEMO_USERS.find((u) => u.email === fbUser.email) || customUsers.find((u) => u.email === fbUser.email);
        const profile: UserProfile = found || {
          uid: fbUser.uid,
          email: fbUser.email || 'user@artishub.io',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Membre',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          role: 'Créatif / Développeur',
          handle: `@${(fbUser.displayName || fbUser.email?.split('@')[0] || 'member').replace(/\s+/g, '_')}`,
          followersCount: 0,
          likesCount: 0,
        };
        localCurrentUser = profile;
        notifyAuth();
      } else if (isFirebaseLive) {
        localCurrentUser = null;
        notifyAuth();
      }
    });
    return () => {
      authListeners.delete(callback);
      unsubscribe();
    };
  }

  return () => {
    authListeners.delete(callback);
  };
};

export const signIn = async (email: string, pass: string): Promise<UserProfile> => {
  if (isFirebaseLive && authInstance) {
    const cred = await signInWithEmailAndPassword(authInstance, email, pass);
    const found = DEMO_USERS.find((u) => u.email === email) || customUsers.find((u) => u.email === email);
    const profile: UserProfile = found || {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || email.split('@')[0],
      avatar: cred.user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Créatif / Développeur',
      handle: `@${email.split('@')[0]}`,
    };
    await saveLiveUserProfile(profile);
    localCurrentUser = profile;
    notifyAuth();
    return profile;
  }

  // Local fallback auth
  await new Promise((res) => setTimeout(res, 600)); // smooth experience
  const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
                  customUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (matched) {
    localCurrentUser = matched;
    notifyAuth();
    return matched;
  }

  // Create temporary profile for any email entered
  const newProfile: UserProfile = {
    uid: `user_${Date.now()}`,
    email: email,
    displayName: email.split('@')[0].replace('.', ' ').replace(/^\w/, (c) => c.toUpperCase()),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'Créatif / Développeur',
    handle: `@${email.split('@')[0].replace(/\W/g, '_')}`,
    followersCount: 1,
    likesCount: 0,
    isCustomAccount: true,
  };
  customUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_USERS, JSON.stringify(customUsers));
  localCurrentUser = newProfile;
  notifyAuth();
  return newProfile;
};

export const signUp = async (email: string, pass: string, displayName: string, role = 'Créatif / Développeur'): Promise<UserProfile> => {
  if (isFirebaseLive && authInstance) {
    const cred = await createUserWithEmailAndPassword(authInstance, email, pass);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: displayName || email.split('@')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: role,
      handle: `@${(displayName || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase()}`,
      followersCount: 0,
      likesCount: 0,
    };
    await saveLiveUserProfile(newProfile);
    localCurrentUser = newProfile;
    notifyAuth();
    return newProfile;
  }

  // Local fallback
  await new Promise((res) => setTimeout(res, 600));
  const newProfile: UserProfile = {
    uid: `user_${Date.now()}`,
    email: email,
    displayName: displayName || email.split('@')[0],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: role,
    handle: `@${(displayName || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase()}`,
    followersCount: 0,
    likesCount: 0,
    isCustomAccount: true,
  };
  customUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_USERS, JSON.stringify(customUsers));
  localCurrentUser = newProfile;
  notifyAuth();
  return newProfile;
};

export const switchDemoUser = (user: UserProfile) => {
  localCurrentUser = user;
  notifyAuth();
};

export const signOut = async () => {
  if (isFirebaseLive && authInstance) {
    await firebaseSignOut(authInstance);
  }
  localCurrentUser = null;
  notifyAuth();
};

// ----------------------------------------------------
// PROJECTS (FIRESTORE COLLECTION: `projects`)
// ----------------------------------------------------
export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  projectListeners.add(callback);
  callback(localProjects);

  if (isFirebaseLive && dbInstance) {
    try {
      const q = query(collection(dbInstance, 'projects'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const liveProjects: Project[] = [];
          snapshot.forEach((d) => {
            liveProjects.push({ id: d.id, ...(d.data() as any) });
          });
          localProjects = liveProjects;
          notifyProjects();
        }
      });
      return () => {
        projectListeners.delete(callback);
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firestore projects listener fallback:', err);
    }
  }

  return () => {
    projectListeners.delete(callback);
  };
};

export const addProject = async (projectData: Omit<Project, 'id' | 'likes' | 'likedBy' | 'commentsCount' | 'createdAt'>): Promise<Project> => {
  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now()}`,
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    comments: [],
    createdAt: new Date().toISOString().split('T')[0],
    views: 1,
  };

  if (isFirebaseLive && dbInstance) {
    try {
      const docRef = await addDoc(collection(dbInstance, 'projects'), newProject);
      newProject.id = docRef.id;
    } catch (err) {
      console.error('Failed to add project to Firestore:', err);
    }
  }

  localProjects.unshift(newProject);
  notifyProjects();
  return newProject;
};

export const toggleProjectLike = async (projectId: string, userUid: string): Promise<{ liked: boolean; count: number }> => {
  const project = localProjects.find((p) => p.id === projectId);
  if (!project) return { liked: false, count: 0 };

  const isLiked = project.likedBy.includes(userUid);
  if (isLiked) {
    project.likedBy = project.likedBy.filter((id) => id !== userUid);
    project.likes = Math.max(0, project.likes - 1);
  } else {
    project.likedBy.push(userUid);
    project.likes += 1;
  }

  if (isFirebaseLive && dbInstance) {
    try {
      const projectRef = doc(dbInstance, 'projects', projectId);
      await updateDoc(projectRef, {
        likes: project.likes,
        likedBy: project.likedBy,
      });
    } catch (err) {
      console.warn('Could not sync like to Firestore:', err);
    }
  }

  notifyProjects();
  return { liked: !isLiked, count: project.likes };
};

export const addProjectComment = async (projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt' | 'likes'>): Promise<ProjectComment> => {
  const project = localProjects.find((p) => p.id === projectId);
  const newComment: ProjectComment = {
    ...comment,
    id: `comm-${Date.now()}`,
    createdAt: 'À l\'instant',
    likes: 0,
  };

  if (project) {
    if (!project.comments) project.comments = [];
    project.comments.unshift(newComment);
    project.commentsCount = project.comments.length;

    if (isFirebaseLive && dbInstance) {
      try {
        const projectRef = doc(dbInstance, 'projects', projectId);
        await updateDoc(projectRef, {
          comments: project.comments,
          commentsCount: project.commentsCount,
        });
      } catch (err) {
        console.warn('Could not sync comment to Firestore:', err);
      }
    }

    notifyProjects();
  }
  return newComment;
};

// ----------------------------------------------------
// COLLABORATIONS (FIRESTORE COLLECTION: `collaborations`)
// ----------------------------------------------------
export const subscribeToCollaborations = (callback: (collabs: CollaborationAd[]) => void) => {
  collabListeners.add(callback);
  callback(localCollaborations);

  if (isFirebaseLive && dbInstance) {
    try {
      const q = query(collection(dbInstance, 'collaborations'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const liveCollabs: CollaborationAd[] = [];
          snapshot.forEach((d) => {
            liveCollabs.push({ id: d.id, ...(d.data() as any) });
          });
          localCollaborations = liveCollabs;
          notifyCollabs();
        }
      });
      return () => {
        collabListeners.delete(callback);
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firestore collabs listener fallback:', err);
    }
  }

  return () => {
    collabListeners.delete(callback);
  };
};

export const addCollaborationAd = async (adData: Omit<CollaborationAd, 'id' | 'postedAgo' | 'createdAt' | 'applications'>): Promise<CollaborationAd> => {
  const newAd: CollaborationAd = {
    ...adData,
    id: `collab-${Date.now()}`,
    postedAgo: 'Posted just now',
    createdAt: new Date().toISOString(),
    applications: [],
  };

  if (isFirebaseLive && dbInstance) {
    try {
      const docRef = await addDoc(collection(dbInstance, 'collaborations'), newAd);
      newAd.id = docRef.id;
    } catch (err) {
      console.error('Failed to add collaboration ad to Firestore:', err);
    }
  }

  localCollaborations.unshift(newAd);
  notifyCollabs();
  return newAd;
};

export const applyToCollaboration = async (adId: string, appData: Omit<CollaborationApplication, 'id' | 'createdAt' | 'adId'>) => {
  const ad = localCollaborations.find((a) => a.id === adId);
  const newApp: CollaborationApplication = {
    ...appData,
    id: `app-${Date.now()}`,
    adId,
    createdAt: new Date().toISOString(),
  };

  if (ad) {
    if (!ad.applications) ad.applications = [];
    ad.applications.push(newApp);

    if (isFirebaseLive && dbInstance) {
      try {
        const adRef = doc(dbInstance, 'collaborations', adId);
        await updateDoc(adRef, {
          applications: ad.applications,
        });
      } catch (err) {
        console.warn('Could not sync application to Firestore:', err);
      }
    }

    notifyCollabs();
  }
  return newApp;
};

// ----------------------------------------------------
// FORUM TOPICS (FIRESTORE COLLECTION: `forum_posts`)
// ----------------------------------------------------
export const subscribeToForumTopics = (callback: (topics: ForumTopic[]) => void) => {
  forumListeners.add(callback);
  callback(localForumTopics);

  if (isFirebaseLive && dbInstance) {
    try {
      const q = query(collection(dbInstance, 'forum_posts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const liveTopics: ForumTopic[] = [];
          snapshot.forEach((d) => {
            liveTopics.push({ id: d.id, ...(d.data() as any) });
          });
          localForumTopics = liveTopics;
          notifyForum();
        }
      });
      return () => {
        forumListeners.delete(callback);
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firestore forum listener fallback:', err);
    }
  }

  return () => {
    forumListeners.delete(callback);
  };
};

export const addForumTopic = async (topicData: Omit<ForumTopic, 'id' | 'repliesCount' | 'viewsCount' | 'lastActivity' | 'createdAt' | 'replies'>): Promise<ForumTopic> => {
  const newTopic: ForumTopic = {
    ...topicData,
    id: `topic-${Date.now()}`,
    repliesCount: 0,
    viewsCount: 1,
    lastActivity: 'Just now',
    createdAt: new Date().toISOString().split('T')[0],
    isNew: true,
    replies: [],
  };

  if (isFirebaseLive && dbInstance) {
    try {
      const docRef = await addDoc(collection(dbInstance, 'forum_posts'), newTopic);
      newTopic.id = docRef.id;
    } catch (err) {
      console.error('Failed to add forum topic to Firestore:', err);
    }
  }

  localForumTopics.unshift(newTopic);
  notifyForum();
  return newTopic;
};

export const addForumReply = async (topicId: string, replyData: Omit<ForumReply, 'id' | 'createdAt' | 'likes'>): Promise<ForumReply> => {
  const topic = localForumTopics.find((t) => t.id === topicId);
  const newReply: ForumReply = {
    ...replyData,
    id: `reply-${Date.now()}`,
    createdAt: 'À l\'instant',
    likes: 0,
    likedBy: [],
  };

  if (topic) {
    if (!topic.replies) topic.replies = [];
    topic.replies.push(newReply);
    topic.repliesCount = topic.replies.length;
    topic.lastActivity = 'Just now';
    topic.lastActivityUser = replyData.author;

    if (isFirebaseLive && dbInstance) {
      try {
        const topicRef = doc(dbInstance, 'forum_posts', topicId);
        await updateDoc(topicRef, {
          replies: topic.replies,
          repliesCount: topic.repliesCount,
          lastActivity: topic.lastActivity,
          lastActivityUser: topic.lastActivityUser,
        });
      } catch (err) {
        console.warn('Could not sync reply to Firestore:', err);
      }
    }

    notifyForum();
  }
  return newReply;
};
