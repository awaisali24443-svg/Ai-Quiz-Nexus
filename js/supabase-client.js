// This file was created to centralize Supabase client initialization and functions.

const SUPABASE_URL = "https://lsceubrqjpcbclbmenow.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzY2V1YnJxanBjYmNsYm1lbm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjE0MjQsImV4cCI6MjA3NzQ5NzQyNH0.wHjFxskw3DYbat67Vw-6GlIfzksLjoOwPQH0JkhrWo8";

// Initial check for placeholder values
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("YOUR_SUPABASE_URL") || SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")) {
    const errorHtml = `<body style="background-color: #0a0a1f; color: #f8fafc; font-family: sans-serif; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center;"><p>Supabase URL/Key not configured in js/supabase-client.js</p></body>`;
    document.documentElement.innerHTML = errorHtml;
    throw new Error("Supabase URL and/or Anon Key are not configured in js/supabase-client.js. App halted.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Supabase Connection Verification ---
async function verifySupabaseConnection() {
  try {
    // Attempt to query a non-existent table with a limit of 0. This is a lightweight check.
    const { error } = await supabase.from('profiles').select('id').limit(1);
    // Note: A "relation does not exist" error can still mean the connection is fine if the table isn't created yet.
    // We are mainly checking for authentication or network errors.
    if (error && error.message.includes('fetch failed')) {
        throw new Error(`Network error: ${error.message}`);
    }
    if (error && (error.message.includes('Invalid API key') || error.message.includes('Unauthorized'))) {
        throw new Error(`Authentication error: ${error.message}`);
    }
    console.log('✅ Supabase Verified: Connection established.');
    localStorage.removeItem('db_error'); // Clear any previous error state
  } catch (err) {
    console.log('⚠️ Supabase Connection Failed — please recheck credentials. Switching to local guest mode.', err.message);
    localStorage.setItem('db_error', 'true');
  }
}
verifySupabaseConnection();


// --- Auth Functions ---
const signUp = (email, password, username) => supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            username: username
        }
    }
});
const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
const signOut = () => supabase.auth.signOut();
const updateUserPassword = (newPassword) => supabase.auth.updateUser({ password: newPassword });

// --- Database & Storage Functions ---
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
            .from('avatars')
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
    getProfile,
    updateProfileAndUser,
    uploadProfilePicture,
    loadQuestions,
    loadUserProgress,
    saveUserProgress
};