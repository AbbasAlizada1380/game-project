import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Assuming axios is configured

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Keep existing initial state structure
const initialState = {
  currentUser: null, // Will include profile_pic_url if logged in
  accessToken: null,
  refreshToken: null,
  error: null,
  loading: false, // General loading state
};

// Keep existing signIn thunk (ensure backend token serializer includes profile_pic_url)
export const signIn = createAsyncThunk(
  "user/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/token/`, credentials);
      const { access, refresh } = response.data;

      // Decode token to get user info initially (less ideal than dedicated endpoint)
      // Or better: Call a /users/profile/me/ endpoint after login to get full user data
      // For now, assuming token includes necessary info including profile_pic_url
      // You might need to adjust this based on your actual token payload
      const tokenPayload = JSON.parse(atob(access.split('.')[1])); // Basic decode

       // Fetch user profile details separately after login (RECOMMENDED)
       let userData = null;
       try {
           const profileResponse = await axios.get(`${BASE_URL}/users/profile/me/`, {
               headers: { Authorization: `Bearer ${access}` },
           });
            // Combine basic token info with detailed profile info
            userData = {
                id: tokenPayload.user_id, // Assuming user_id is in token
                email: tokenPayload.email,
                first_name: tokenPayload.first_name,
                last_name: tokenPayload.last_name,
                role: tokenPayload.role,
                phone_number: tokenPayload.phone_number,
                is_active: tokenPayload.is_active,
                is_staff: tokenPayload.is_staff,
                is_superuser: tokenPayload.is_superuser,
                // Overwrite profile URL with fresh data from profile endpoint
                profile_pic_url: profileResponse.data.profile_pic_url,
                // Include other fields from profileResponse.data if needed
                address: profileResponse.data.address,
            };
       } catch (profileError) {
           console.error("Failed to fetch user profile after login:", profileError);
           // Fallback to just token data if profile fetch fails
             userData = {
                 id: tokenPayload.user_id,
                 email: tokenPayload.email,
                 first_name: tokenPayload.first_name,
                 last_name: tokenPayload.last_name,
                 role: tokenPayload.role,
                 phone_number: tokenPayload.phone_number,
                 is_active: tokenPayload.is_active,
                 is_staff: tokenPayload.is_staff,
                 is_superuser: tokenPayload.is_superuser,
                 profile_pic_url: tokenPayload.profile_pic_url, // From token as fallback
             };
       }


      return {
        accessToken: access,
        refreshToken: refresh,
        userData: userData, // userData now includes profile_pic_url
      };
    } catch (error) {
      const errorData = error.response?.data;
      const message = typeof errorData === 'string' ? errorData : errorData?.detail || JSON.stringify(errorData) || "Login failed";
      return rejectWithValue(message);
    }
  }
);


// Keep existing createUser thunk (adjust endpoint/logic if needed for admin vs public)
export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue, getState }) => { // Add getState if auth needed
    try {
       // *** Determine endpoint and if auth is needed ***
       // If admin creates user via UserViewSet: /users/user/create_user/ (POST)
       // If public registration: /users/create/ (POST)
       const endpoint = `${BASE_URL}/user/create/`; // Example: Public registration endpoint
       // const { accessToken } = getState().user; // Get token if required
      console.log(userData);
       
      const response = await axios.post(
         endpoint,
         userData
         // { headers: { Authorization: `Bearer ${accessToken}` } } // Add headers if auth needed
         );
      return response.data; // Usually just contains success message
    } catch (error) {
        const errorData = error.response?.data;
        const message = typeof errorData === 'string' ? errorData : errorData?.detail || JSON.stringify(errorData) || "User creation failed";
      console.log(error);
        
      return rejectWithValue(message);
    }
  }
);

// Keep existing updateUser thunk (for text info like name, address)
export const updateUser = createAsyncThunk(
  "user/updateUser",
  // Expects userData with fields like first_name, last_name, address
  // Backend endpoint /users/profile/me/ likely doesn't need ID
  async ({ userData }, { rejectWithValue, getState }) => {
    try {
      const { accessToken } = getState().user;
      if (!accessToken) return rejectWithValue("Not authenticated");

      // Use PATCH to update profile info (non-picture fields)
      const response = await axios.patch(
        `${BASE_URL}/users/profile/me/`, // Endpoint for current user profile
        userData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // Backend should return updated ProfileSerializer data
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const message = typeof errorData === 'string' ? errorData : errorData?.detail || JSON.stringify(errorData) || "Update failed";
      return rejectWithValue(message);
    }
  }
);

// --- ADDED: Thunk for updating profile picture ---
export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async ({ file }, { rejectWithValue, getState }) => {
    const { accessToken, currentUser } = getState().user;
    if (!accessToken || !currentUser) {
      return rejectWithValue("Not authenticated or no user data");
    }

    const formData = new FormData();
    // *** Ensure 'profile_pic' matches the backend serializer field name ***
    formData.append("profile_pic", file);

    try {
       // Send PATCH request to the current user's profile endpoint
       // The backend's ProfileSerializer update method handles the 'profile_pic' field
      const response = await axios.patch(
        `${BASE_URL}/users/profile/me/`, // Same endpoint as text info update
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // Axios sets Content-Type to multipart/form-data automatically for FormData
          },
        }
      );
      // Expecting updated profile data (including new profile_pic_url)
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      // Try to extract specific error message for profile_pic if available
      const message = typeof errorData === 'string' ? errorData : errorData?.profile_pic?.[0] || errorData?.detail || JSON.stringify(errorData) || "Image upload failed";
      return rejectWithValue(message);
    }
  }
);
// --- END ADDED ---


const userSlice = createSlice({
  name: "user",
  initialState,
  // Keep existing reducers (signOutSuccess)
  reducers: {
    signOutSuccess: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.loading = false;
    },
     clearUserError: (state) => { // Optional: action to clear error message
         state.error = null;
     }
  },
  extraReducers: (builder) => {
    builder
      // Keep existing signIn reducers (ensure fulfilled stores profile_pic_url)
      .addCase(signIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signIn.fulfilled, (state, action) => {
        state.currentUser = action.payload.userData; // This now includes profile_pic_url
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.loading = false;
      })
      .addCase(signIn.rejected, (state, action) => { state.error = action.payload; state.loading = false; })

      // Keep existing createUser reducers
      .addCase(createUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createUser.fulfilled, (state) => { state.loading = false; /* No state change needed */ })
      .addCase(createUser.rejected, (state, action) => { state.error = action.payload; state.loading = false; })

      // Keep existing updateUser reducers (for text info)
      .addCase(updateUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Merge updated fields from payload (ProfileSerializer data) into currentUser
        if (state.currentUser && action.payload) {
           state.currentUser.first_name = action.payload.user_details?.first_name ?? state.currentUser.first_name;
           state.currentUser.last_name = action.payload.user_details?.last_name ?? state.currentUser.last_name;
           state.currentUser.address = action.payload.address ?? state.currentUser.address;
           // Potentially update other fields if returned by ProfileSerializer
        }
      })
      .addCase(updateUser.rejected, (state, action) => { state.error = action.payload; state.loading = false; })

      // --- ADDED: Reducers for profile picture update ---
      .addCase(updateProfilePicture.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        // Update profile pic URL in currentUser state from the response payload
        if (state.currentUser && action.payload?.profile_pic_url) {
          state.currentUser.profile_pic_url = action.payload.profile_pic_url;
        }
        // Also update other fields if the backend returns them in the same response
         if (state.currentUser && action.payload) {
           state.currentUser.address = action.payload.address ?? state.currentUser.address;
           // Update names if user_details are included in this response too
            state.currentUser.first_name = action.payload.user_details?.first_name ?? state.currentUser.first_name;
            state.currentUser.last_name = action.payload.user_details?.last_name ?? state.currentUser.last_name;
         }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => { state.error = action.payload; state.loading = false; });
      // --- END ADDED ---
  },
});

// Export actions including the new one if needed elsewhere
export const { signOutSuccess, clearUserError } = userSlice.actions;
export default userSlice.reducer;