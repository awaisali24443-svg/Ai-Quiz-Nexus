// This file was created to centralize Supabase client initialization and functions.

// ===================================================================================
// IMPORTANT: CONFIGURATION REQUIRED
// You must replace the placeholder values below with your actual Supabase project URL and Anon Key.
// You can find these in your Supabase project's API settings.
// The app will not work until you do this.
const SUPABASE_URL = "https://lsceubrqjpcbclbmenow.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzY2V1YnJxanBjYmNsYm1lbm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE0MjQsImV4cCI6MjA3NzQ5NzQyNH0.wHjFxskw3DYbat67Vw-6GlIfzksLjoOwPQH0JkhrWo8";
// ===================================================================================


if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
    const errorHtml = `
        <body style="background-color: #0a0a1f; color: #f8fafc; font-family: sans-serif; margin: 0;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem;">
                <h1 style="color: #ff4d4d; border-bottom: 2px solid #ff4d4d; padding-bottom: 0.5rem; margin-bottom: 1rem;">Configuration Error</h1>
                <p style="font-size: 1.2rem; max-width: 600px; text-align: center;">The application is not configured correctly.</p>
                <p style="max-width: 600px; text-align: center; color: #94a3b8;">Please edit the file <code style="background-color: #333; padding: 0.2rem 0.5rem; border-radius: 4px;">js/supabase-client.js</code> and replace the placeholder values for <code style="background-color: #333; padding: 0.2rem 0.5rem; border-radius: 4px;">SUPABASE_URL</code> and <code style="background-color: #333; padding: 0.2rem 0.5rem; border-radius: 4px;">SUPABASE_ANON_KEY</code> with your project's credentials.</p>
            </div>
        </body>
    `;
    document.documentElement.innerHTML = errorHtml;
    throw new Error("Supabase URL and/or Anon Key are not configured in js/supabase-client.js. App halted.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth Functions ---
const signUp = (email, password) => supabase.auth.signUp({ email, password });
const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
const signOut = () => supabase.auth.signOut();
const updateUserPassword = (newPassword) => supabase.auth.updateUser({ password: newPassword });

// --- Database & Storage Functions ---
const createProfile = async (user, username) => {
    // Also update the user's metadata in Supabase Auth for quick access
    await supabase.auth.updateUser({ data: { username: username } });
    
    const { error } = await supabase.from('profiles').insert({ 
        id: user.id, 
        username, 
        email: user.email 
    });
    if (error) console.error('Error creating profile:', error);
    return { error };
};

const getProfile = (user) => {
    return supabase
        .from('profiles')
        .select('username, profile_picture_url')
        .eq('id', user.id)
        .single();
};

const updateProfileAndUser = async (userId, { username, profile_picture_url }) => {
    const updateData = { username };
    if (profile_picture_url !== undefined) {
        updateData.profile_picture_url = profile_picture_url;
    }
    
    // 1. Update auth user metadata
    const { data, error: userError } = await supabase.auth.updateUser({ data: updateData });
    if (userError) return { data: null, error: userError };
    
    // 2. Update profiles table
    const { error: profileError } = await supabase.from('profiles').update(updateData).eq('id', userId);
    if (profileError) return { data: null, error: profileError };

    return { data, error: null };
};

const uploadProfilePicture = async (userId, base64FileData) => {
    try {
        if (!base64FileData.startsWith('data:image/')) {
            throw new Error('Invalid image data format.');
        }
        const fileExt = base64FileData.substring(base64FileData.indexOf('/') + 1, base64FileData.indexOf(';'));
        const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

        const res = await fetch(base64FileData);
        const blob = await res.blob();
        
        const { data, error } = await supabase.storage
            .from('avatars') // IMPORTANT: Create a bucket named 'avatars' in your Supabase project.
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
        return { data: { publicUrl: urlData.publicUrl }, error: null };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return { data: null, error };
    }
};

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
    updateUserPassword,
    createProfile,
    getProfile,
    updateProfileAndUser,
    uploadProfilePicture,
    loadQuestions,
    loadUserProgress,
    saveUserProgress
};