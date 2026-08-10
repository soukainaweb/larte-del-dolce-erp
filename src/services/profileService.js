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
    return api.put("/profile/password", {
        current_password: data.current_password ?? data.currentPassword,
        password: data.password ?? data.newPassword,
        password_confirmation: data.password_confirmation ?? data.newPassword_confirmation ?? data.confirmPassword,
    });
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

// Update availability
export const updateAvailability = (availabilityStatus) => {
    return api.put("/profile/availability", { availability_status: availabilityStatus });
};