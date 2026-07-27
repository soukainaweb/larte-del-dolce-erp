import api from "./api";

// Get profile
export const getProfile = () => {
    return api.get("/profile");
};

// Update profile
export const updateProfile = (data) => {
    return api.put("/profile", data);
};

// Change password
export const changePassword = (data) => {
    return api.put("/profile/change-password", data);
};

// Upload avatar
export const uploadAvatar = (file) => {
    const formData = new FormData();

    formData.append("avatar", file);

    return api.post("/profile/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Delete avatar
export const deleteAvatar = () => {
    return api.delete("/profile/avatar");
};