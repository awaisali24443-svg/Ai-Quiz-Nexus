// This file was created to centralize Supabase client initialization and functions.

// IMPORTANT: The user must add these environment variables to their Render.com service.
// In a local environment, you can use a .env file and a bundler, or create a `config.js` file.
// For this tool's environment, we assume these are globally available.
const SUPABASE_URL = process.env.SUPABASE_URL; 
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    alert("CRITICAL ERROR: Supabase environment variables are not set. The app cannot function.");
    console.error("Supabase URL and/or Anon Key are missing.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth Functions ---
const signUp = async (email, password) => supabase.auth.signUp({ email, password });
const signIn = async (email, password) => supabase.auth.signInWithPassword({ email, password });
const signOut = async () => supabase.auth.signOut();
const getSession = async () => supabase.auth.getSession();
const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// --- Database Functions ---

// Creates a user profile entry after signup
const createProfile = async (user, username) => {
    const { error } = await supabase.from('profiles').insert({ 
        id: user.id, 
        username, 
        email: user.email 
    });
    if (error) console.error('Error creating profile:', error);
    return { error };
};

// Gets user profile (e.g., username)
const getProfile = async (user) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, profile_picture_url')
        .eq('id', user.id)
        .single();
    if (error) console.error('Error fetching profile:', error);
    return { data, error };
};

// Loads quiz questions from the database
const loadQuestions = async (topicId, level) => {
    const { data, error } = await supabase
        .from('questions')
        .select('q, options, answer')
        .eq('topic_id', topicId)
        .eq('level', level)
        .limit(10);
    
    if (error) {
        console.error('Error loading questions from Supabase:', error);
        return [];
    }
    return data;
};

// Saves a user's quiz attempt
const saveAttempt = async (userId, topicId, level, score) => {
    const { error } = await supabase.from('attempts').insert({
        user_id: userId,
        topic_id: topicId,
        level: level,
        score: score,
    });
    if (error) console.error('Error saving attempt:', error);
};

// Gets and sets user progress (unlocked levels, hints, etc.)
const loadUserProgress = async (userId) => {
    const { data, error } = await supabase
        .from('user_progress')
        .select('progress_data')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading progress:', error);
    }
    return data ? data.progress_data : null;
};

const saveUserProgress = async (userId, progressData) => {
    const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        progress_data: progressData
    }, { onConflict: 'user_id' });

    if (error) console.error('Error saving progress:', error);
};

export const SupabaseClient = {
    supabase,
    signUp,
    signIn,
    signOut,
    getSession,
    getUser,
    createProfile,
    getProfile,
    loadQuestions,
    saveAttempt,
    loadUserProgress,
    saveUserProgress
};